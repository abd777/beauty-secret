const shoreService = require("../services/shoreService");

module.exports = function (app) {
  app.get("/services", async (req, res) => {
    const services = await shoreService.getServices();
    res.send(services);
  });
  app.get("/slots/:id", async (req, res) => {
    //appointmentController.createCustomer(req, res);
    const date = req.query.date ? req.query.date : null;
    const slots = await shoreService.getSlots(req.params.id, date);
    res.send(slots);
  });
  app.post("/appointment", async (req, res) => {
    const contactData = await shoreService.createCustomer(req.body.contact);
    console.log(JSON.parse(contactData));
    const data = await shoreService.createAppointment(req.body.date, JSON.parse(contactData).data.id, req.body.serviceId);
    res.send(data);
  })
};
