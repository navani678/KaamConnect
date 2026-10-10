export const ok = (res, data = null, status = 200) => {
  return res.status(status).json({
    success: true,
    data
  });
};
