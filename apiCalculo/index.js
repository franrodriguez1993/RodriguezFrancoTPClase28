const express = require("express");
const app = express();
const router = express.Router();
const PORT = 5001;
const { fork } = require("child_process");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**~~~~~~~~~~~~~~~ROUTER~~~~~~~~~~~~~~~~~~**/
router.get("/api/calculo", (req, res) => {
  const forkedProcess = fork("./calculo.js");
  const numero = req.query.num || 100000000;
  forkedProcess.send(numero);
  forkedProcess.on("message", (result) => {
    return res.json(result);
  });
});

app.use(router);
app.listen(PORT, () => {
  console.log("conectado en http://localhost:5001");
});
