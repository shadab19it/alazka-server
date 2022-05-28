const { User, userSchema } = require("../modals/User");
const uuidAPIKey = require("uuid-apikey");
const { APIProcessFile } = require("../modals/APIProcessFile");

exports.generateApiKey = async (req, res) => {
  const userId = req.loggedUser._id;
  const key = uuidAPIKey.create({ noDashes: true });
  User.findOneAndUpdate(
    { _id: userId },
    { apiKey: userId + key.apiKey },
    { new: true },

    (err, user) => {
      if (err) return res.status(402).json({ msg: "User not found", success: false });
      return res.status(200).json({ msg: "API key generated successfully!", apiKey: userId + key.apiKey, success: true });
    }
  );
};

exports.validateAPIKEY = async (req, res) => {
  const apiKey = req.params["apiKey"];
  const totalPages = +req.params["totalPages"];
  // find user by API Key
  User.findOne({ apiKey }, async (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: "Sorry this API key is not valid" });
    }
    if (!user.isActive)
      return res.status(423).json({ message: "Sorry you are no longer Active user! Please Contact us at : automate@alazka.ai " });

    if (user.leftCredit < totalPages)
      return res.status(423).json({ message: "Sorry you don't have enought Credit left Please Contact us at : automate@alazka.ai " });

    return res.status(200).json({ success: true, okay: "OKAY" });
  });
};

exports.getAPIKeyByUserId = async (req, res) => {
  const userId = req.params["userId"];
  // find user by API Key
  User.findOne({ _id: userId }, async (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.apiKey)
      return res.status(401).json({ message: "Sorry your API Key not generated yet! Please Generate it", isCreated: false });

    return res.status(200).json({ apiKey: user.apiKey, isCreated: true });
  });
};

exports.removeAPICredit = async (req, res) => {
  const apiKey = req.params["apiKey"];
  const totalPages = +req.params["totalPages"];
  User.findOneAndUpdate(
    { apiKey: apiKey, role: "user", leftCredit: { $gt: 0 } },
    { $inc: { leftCredit: -totalPages } },
    { new: true },
    async (err, updatedUser) => {
      if (updatedUser === null) {
        return res.status(400).json({ error: "Unable to find user" });
      }
      const saveAPIProcessFile = await new APIProcessFile({ user_id: updatedUser._id, success: true, noOf_pages: totalPages });
      const saveFile = await saveAPIProcessFile.save();
      return res
        .status(200)
        .json({ msg: "Credit Updated", totalCredit: updatedUser.totalCredit, leftCredit: updatedUser.leftCredit, success: true });
    }
  );
};
