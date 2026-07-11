module.exports = async (req, res) => {
  try {
    res.status(200).json({ status: 'ok', url: req.url });
  } catch (err) {
    try { res.status(500).json({ error: err.message }); } catch(e) { console.error(e); }
  }
};
