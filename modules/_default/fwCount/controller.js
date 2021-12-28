module.exports = app => {
  app.get('/api/count/undong', (req, res) => app.model.fwCount.get({ name: 'Undong' }, (error, item) => {
    app.model.fwCount.update({ name: 'Undong' }, { views: item.views + 1 }, (error, view) => {
      res.send({ error, item: view });
    });
  }));
};