import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

router.get("/verNivel/:id", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const id = parseInt(req.params.id);

        const nivel = await prisma.cambialo.findUnique({
          where: {
            id: Number(id),
          },
        });

        if (!nivel) {
          res.status(404).json({
            message: "El nivel no existe o ha sido borrado",
          });
          return;
        }

        res.json({
          message: "Nivel",
          juego: nivel,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

router.post("/agregarTrabajo", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { enunciado, emocion, idTema } = req.body;
        const cambialo = await prisma.cambialo.create({
          data: {
            enunciado: enunciado,
            emocion: emocion,
          },
        });

        await prisma.juegos.create({
          data: {
            idTema: Number(idTema),
            nombreJuego: "Cambialo YA",
            idJuego: cambialo.id,
          },
        });

        res.json({
          message: "Trabajo agregado",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

router.post("/agregarRespuesta", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { respuesta, id } = req.body;
        const idAlumno = payload.id;
        const nombre = payload.nombre;
        const apellido = payload.apaterno;

        const rj = await prisma.juegos.findUnique({
          where: {
            id: Number(id),
          },
          select: {
            nombreJuego: true,
            idJuego: true,
          },
        });

        if (!rj) {
          res.status(404).json({
            message: "El juego no existe o ha sido borrado",
          });
          return;
        }

        if (rj.nombreJuego === "Cambialo YA") {
          await prisma.res_cambialo.create({
            data: {
              idCambialo: Number(rj.idJuego),
              respuesta: respuesta,
              idAlumno: Number(idAlumno),
              nombre: nombre,
              apaterno: apellido,
            },
          });
          res.json({
            message: "Respuesta enviada",
          });
        } else {
          res.status(404).json({
            message: "No se encontro el juego",
          });
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

router.post("/enviarRespuesta", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { respuesta, id } = req.body;
        const idAlumno = payload.id;
        const nombre = payload.nombre;
        const apellido = payload.apaterno;

        await prisma.res_cambialo.create({
          data: {
            idCambialo: Number(id),
            respuesta: respuesta,
            idAlumno: Number(idAlumno),
            nombre: nombre,
            apaterno: apellido,
          },
        });
        res.json({
          message: "Respuesta enviada",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

export default router;
