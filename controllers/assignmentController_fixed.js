// ...contenido anterior...

// Agregar estas funciones al final del archivo assignmentController.js

// ========== NUEVA FUNCIONALIDAD: GESTIÓN GRUPAL DE ASIGNACIONES ==========

// Obtener asignaciones agrupadas por título para gestión masiva
export const getGroupedAssignments = async (req, res) => {
    try {
        // Verificar que el usuario sea administrador
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Solo los administradores pueden acceder a esta funcionalidad'
            });
        }

        const { search = '', sort = '-createdAt' } = req.query;

        console.log('🔍 Obteniendo asignaciones agrupadas:', { search, sort });

        // Construir filtros para búsqueda
        const matchFilters = {};
        if (search) {
            matchFilters.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Agregar filtro para excluir asignaciones programadas
        matchFilters.scheduledPublish = { $ne: true };

        // Usar agregación para agrupar asignaciones por título y fechas
        const groupedAssignments = await Assignment.aggregate([
            {
                $match: matchFilters
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'teacherInfo'
                }
            },
            {
                $unwind: '$teacherInfo'
            },
            {
                $group: {
                    _id: {
                        title: '$title',
                        description: '$description',
                        dueDate: '$dueDate',
                        closeDate: '$closeDate',
                        createdAt: '$createdAt'
                    },
                    assignments: {
                        $push: {
                            assignmentId: '$_id',
                            teacherId: '$teacherInfo._id',
                            teacherName: {
                                $concat: ['$teacherInfo.nombre', ' ', '$teacherInfo.apellidoPaterno', ' ', '$teacherInfo.apellidoMaterno']
                            },
                            teacherEmail: '$teacherInfo.email',
                            status: '$status',
                            responses: '$responses'
                        }
                    },
                    totalTeachers: { $sum: 1 },
                    createdAt: { $first: '$createdAt' }
                }
            },
            {
                $addFields: {
                    title: '$_id.title',
                    description: '$_id.description',
                    dueDate: '$_id.dueDate',
                    closeDate: '$_id.closeDate',
                    // Calcular estadísticas del grupo
                    completedCount: {
                        $size: {
                            $filter: {
                                input: '$assignments',
                                cond: { $eq: ['$$this.status', 'completed'] }
                            }
                        }
                    },
                    pendingCount: {
                        $size: {
                            $filter: {
                                input: '$assignments',
                                cond: { $eq: ['$$this.status', 'pending'] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    groupId: '$_id',
                    title: 1,
                    description: 1,
                    dueDate: 1,
                    closeDate: 1,
                    createdAt: 1,
                    assignments: 1,
                    totalTeachers: 1,
                    completedCount: 1,
                    pendingCount: 1,
                    completionRate: {
                        $cond: [
                            { $eq: ['$totalTeachers', 0] },
                            0,
                            { $multiply: [{ $divide: ['$completedCount', '$totalTeachers'] }, 100] }
                        ]
                    }
                }
            },
            {
                $sort: sort === '-createdAt' ? { createdAt: -1 } :
                       sort === 'createdAt' ? { createdAt: 1 } :
                       sort === 'title' ? { title: 1 } :
                       sort === '-title' ? { title: -1 } :
                       { createdAt: -1 }
            }
        ]);

        console.log(`✅ Grupos encontrados: ${groupedAssignments.length}`);

        res.json({
            success: true,
            data: {
                groups: groupedAssignments,
                total: groupedAssignments.length
            }
        });

    } catch (error) {
        console.error('❌ Error obteniendo asignaciones agrupadas:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener las asignaciones agrupadas'
        });
    }
};

// Actualizar estados masivos de docentes en un grupo de asignaciones
export const updateGroupAssignmentStatus = async (req, res) => {
    try {
        // Verificar que el usuario sea administrador
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Solo los administradores pueden actualizar estados masivamente'
            });
        }

        const { assignmentIds, status } = req.body;

        console.log('🔄 Actualizando estados masivos:', {
            assignmentIds: assignmentIds?.length,
            status
        });

        // Validar datos de entrada
        if (!assignmentIds || !Array.isArray(assignmentIds) || assignmentIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere un array de IDs de asignaciones'
            });
        }

        // Validar estado
        const validStatuses = ['completed', 'completed-late', 'not-delivered', 'pending'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Estado no válido'
            });
        }

        const now = new Date();
        const updatedAssignments = [];

        // Procesar cada asignación
        for (const assignmentId of assignmentIds) {
            try {
                const assignment = await Assignment.findById(assignmentId);
                if (!assignment) {
                    console.log(`❌ Asignación no encontrada: ${assignmentId}`);
                    continue;
                }

                // Obtener el docente asignado (debería ser solo uno por asignación)
                const teacherId = assignment.assignedTo[0];
                if (!teacherId) {
                    console.log(`❌ No hay docente asignado: ${assignmentId}`);
                    continue;
                }

                // Mapear estados del frontend al sistema interno del backend
                let submissionStatus = 'on-time';
                let responseStatus = 'submitted';
                let submittedAt = null;

                switch (status) {
                    case 'completed':
                        submissionStatus = 'on-time';
                        responseStatus = 'submitted';
                        submittedAt = now;
                        break;
                    case 'completed-late':
                        submissionStatus = 'late';
                        responseStatus = 'submitted';
                        submittedAt = now;
                        break;
                    case 'not-delivered':
                        submissionStatus = 'closed';
                        responseStatus = 'reviewed';
                        submittedAt = null;
                        break;
                    case 'pending':
                        submissionStatus = null;
                        responseStatus = null;
                        submittedAt = null;
                        break;
                }

                // Buscar respuesta existente del docente
                let teacherResponse = assignment.responses.find(r =>
                    r.user.toString() === teacherId.toString()
                );

                if (status === 'pending') {
                    // Si se establece como pendiente, eliminar la respuesta existente
                    if (teacherResponse) {
                        assignment.responses = assignment.responses.filter(r =>
                            r.user.toString() !== teacherId.toString()
                        );
                    }
                } else {
                    // Para otros estados, crear o actualizar la respuesta
                    if (teacherResponse) {
                        // Actualizar respuesta existente
                        teacherResponse.submissionStatus = submissionStatus;
                        teacherResponse.status = responseStatus;
                        teacherResponse.submittedAt = submittedAt;
                    } else {
                        // Crear nueva respuesta
                        assignment.responses.push({
                            user: teacherId,
                            files: [],
                            submittedAt: submittedAt,
                            submissionStatus: submissionStatus,
                            status: responseStatus
                        });
                    }
                }

                // Actualizar el estado base de la asignación
                assignment.status = status === 'pending' ? 'pending' : 'completed';
                assignment.updatedAt = now;
                assignment.updatedBy = req.user._id;

                await assignment.save();
                updatedAssignments.push(assignmentId);

                console.log(`✅ Asignación actualizada: ${assignmentId} -> ${status}`);

            } catch (error) {
                console.error(`❌ Error actualizando asignación ${assignmentId}:`, error);
            }
        }

        console.log(`✅ Actualizaciones completadas: ${updatedAssignments.length}/${assignmentIds.length}`);

        res.json({
            success: true,
            message: `${updatedAssignments.length} asignación(es) actualizada(s) exitosamente`,
            data: {
                updatedCount: updatedAssignments.length,
                totalRequested: assignmentIds.length,
                updatedAssignments,
                newStatus: status
            }
        });

    } catch (error) {
        console.error('❌ Error en actualización masiva:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al actualizar estados masivamente'
        });
    }
};
