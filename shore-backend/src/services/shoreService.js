const shoreAuthService = require("./shoreAuthService");
var moment = require("moment");
var axios = require("axios");

let shoreKey = "";

const lalala = "https://my.shore.com/api/v2/services";

var reqConfig = {
  method: "get",
  url: lalala,
  headers: {
    Accept: "*/*",
    Authorization: `Bearer ${shoreKey}`,
  },
};

function getReqConf(endpoint, reqMethod) {
  return (reqConfig = {
    method: reqMethod,
    url: "https://api.shore.com/v2" + endpoint,
    headers: {
      Accept: "*/*",
      Authorization: `Bearer ${shoreKey}`,
    },
  });
}

module.exports = {
  async getServices() {
    shoreKey = await shoreAuthService.getShoreKey();
    const catConf = getReqConf("/service_categories", "get");
    let categories = [];
    await axios(catConf)
      .then(function (response) {
        response.data.data.forEach((element) =>
          categories.push({ name: element.attributes.name, id: element.id })
        );
      })
      .catch(function (error) {
        console.log(error);
      });
    let services = [];
    let itemsProcessed = 0;
    await Promise.all(
      categories.map(async (cat) => {
        const conf = getReqConf(
          `/services?filter[service_category]=${cat.id}`,
          "get"
        );
        await axios(conf)
          .then(function (response) {
            services.push({
              categorie: cat.name,
              services: response.data.data,
            });
          })
          .catch(function (error) {
            console.log(error);
          });
      })
    );
    return services;
  },

  async getSlots(service_id, date) {
    shoreKey = await shoreAuthService.getShoreKey();
    const startDate = date == null ? moment() : moment(date);
    const endDate =
      date == null ? moment().add(23, "hours") : moment(date).add(23, "hours");
    console.log(endDate);
    console.log(startDate);
    const conf = getReqConf(
      `/availability/slots/5b88cc5f-9e6a-4e46-86a3-a6b78d46a8a2?required_capacity=1&search_weeks_range=1&starts_at=${startDate.format(
        "YYYY-MM-DDTHH:mm:ss"
      )}Z&ends_at=${endDate.format(
        "YYYY-MM-DDTHH:mm:ss"
      )}Z&&services_resources[][service_id]=${service_id}`,
      "get"
    );
    console.log(reqConfig.url);
    let slots = null;
    console.log(conf);
    await axios(conf)
      .then(function (response) {
        slots = JSON.stringify(response.data.slots);
      })
      .catch(function (error) {
        console.log(error);
      });
    console.log(slots);
    return slots;
  },

  async createAppointment(date, customerId, serviceId) {
    shoreKey = await shoreAuthService.getShoreKey();
    var axios = require("axios");
    var data = JSON.stringify({
      data: {
        type: "appointments",
        attributes: {
          starts_at: `${date.date}T${date.time}:00Z`,
          title: "",
          color: "#bdd7a5",
          participant_count: "1",
          address: {
            line1: "Rosenheimer Str. 1",
            line2: "",
            city: "München",
            state: "Bayern",
            country: "DE",
            postal_code: "12345",
          },
          steps: [
            {
              name: "Working step",
              break: false,
              with_customer: true,
              duration: 60,
              resource_ids: [],
              service_id: serviceId,
              employee_selected_by: "customer",
            },
          ],
        },
        relationships: {
          merchant: {
            data: {
              type: "merchants",
              id: "5b88cc5f-9e6a-4e46-86a3-a6b78d46a8a2",
            },
          },
          customer: {
            data: {
              type: "customers",
              id: customerId,
            },
          },
        },
      },
    });
    reqConfig = {
      method: "post",
      url: "https://api.shore.com/v2/appointments",
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${shoreKey}`,
        "Content-Type": "application/vnd.api+json",
      },
      data: data,
    };
    var res;
    axios(reqConfig)
      .then(function (response) {
        res = JSON.stringify(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
    return res;
  },

  async createCustomer(customer) {
    shoreKey = await shoreAuthService.getShoreKey();
    console.log(customer);
    console.log(typeof customer.email);
    const customerBody = JSON.stringify({
      data: {
        type: "customers",
        attributes: {
          birthdate: customer.age,
          opt_in: true,
          opt_in_origin: "app-shell",
          vip: false,
          given_name: customer.fistName,
          surname: customer.lastName,
          addresses: [
            {
              name: "work",
              line1: customer.address.street + ' ' + customer.address.houseNmbr,
              line2: "",
              city: customer.address.city,
              state: customer.address.state,
              country: "CH",
              postal_code: customer.address.zipCode,
            },
          ],
          phones: [
            {
              name: "Home",
              value: customer.phone,
            },
          ],
          emails: [
            {
              name: "Work",
              value: customer.email,
            },
          ],
        },
        relationships: {
          merchant: {
            data: {
              type: "merchants",
              id: "5b88cc5f-9e6a-4e46-86a3-a6b78d46a8a2",
            },
          },
        },
      },
    }
);
    let headers = {
      Accept: "application/vnd.api+json",
      "Content-type": "application/vnd.api+json",
      Authorization: `Bearer ${shoreKey}`,
    };
    var res;
    await axios
      .post("https://api.shore.com/v2/customers", customerBody, {
        headers: headers,
      })
      .then(function (response) {
        res = JSON.stringify(response.data);
      })
      .catch(function (error) {
        res = JSON.stringify(error);
      });
    return res;
  },
};
