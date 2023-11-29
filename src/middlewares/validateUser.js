const validateUser = (req, res, next) => {
    const { firstname, lastname, email, city, language } = req.body;
    const errors = [];
    const emailRegex = /[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,3}/;
  
    if (firstname == null) {
      errors.push({ field: "firstname", message: "This field is required" });
    }
    if (lastname == null) {
      errors.push({ field: "lastname", message: "This field is required" });
    }
    if (!emailRegex.test(email)) {
      errors.push({ field: "email", message: "This field is required" });
    }
    if (city == null) {
      errors.push({ field: "city", message: "This field is required" });
    }
    if (language == null) {
      errors.push({ field: "language", message: "This field is required" });
    }
   
    if (errors.length) {
      res.status(422).json({ validationErrors: errors });
    } else {
      next();
    }
  };

  module.exports = validateUser;