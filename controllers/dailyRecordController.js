import DailyRecord from '../models/DailyRecord.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = 'uploads/evidencias';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

export const upload = multer({ storage: storage });

// Crear nuevo registro
export const createRecord = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }    const {
      fecha,
      horaEntrada,
      horaSalida,
      horasRealizadas,
      titulo,
      descripcion,
      observaciones
    } = req.body;

    if (!fecha || !horaEntrada || !horaSalida || !horasRealizadas || !titulo || !descripcion) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Las observaciones son opcionales, así que no se incluyen en la validación

    // Procesar archivos subidos
    const evidencias = req.files ? req.files.map(file => ({
      nombre: file.originalname,
      url: `/evidencias/${file.filename}`,
      tipo: file.mimetype,
      ruta: file.path
    })) : [];    const nuevoRegistro = new DailyRecord({
      usuario: req.user._id,
      fecha: new Date(fecha),
      horaEntrada,
      horaSalida,
      horasRealizadas: parseFloat(horasRealizadas),
      titulo,
      descripcion,
      observaciones: observaciones || '', // Si no se proporciona, se usa cadena vacía
      evidencias
    });

    await nuevoRegistro.save();

    res.status(201).json({
      success: true,
      message: 'Registro creado exitosamente',
      data: nuevoRegistro
    });

  } catch (error) {
    console.error('Error al crear registro:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un registro para esta fecha'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear el registro',
      error: error.message
    });
  }
};

// Obtener registros por usuario
export const getRecordsByUser = async (req, res) => {
  try {
    const registros = await DailyRecord.find({ usuario: req.user._id })
      .populate('usuario', 'nombre apellidoPaterno')
      .sort({ fecha: -1 });

    res.json({
      success: true,
      data: registros
    });

  } catch (error) {
    console.error('Error al obtener registros:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los registros',
      error: error.message
    });
  }
};

// Obtener registro por fecha
export const getRecordByDate = async (req, res) => {
  try {
    const { fecha } = req.params;
    const registro = await DailyRecord.findOne({
      usuario: req.user._id,
      fecha: new Date(fecha)
    });
    if (registro) {
      res.json(registro);
    } else {
      res.status(404).json({ message: 'Registro no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
