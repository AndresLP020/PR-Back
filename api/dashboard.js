// Serverless handler para /api/dashboard compatible con Vercel
module.exports = (req, res) => {
  if (req.method === 'GET') {
    res.status(200).json({ message: 'Dashboard funcionando correctamente en serverless.' });
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
};
