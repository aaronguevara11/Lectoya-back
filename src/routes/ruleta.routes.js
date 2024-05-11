import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

router.post("/agregarRuleta", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const {pregunta1, pregunta2, pregunta3, pregunta4, pregunta5, idTema} = req.body;

        const temaExiste = await prisma.temas.findUnique({
          where: {
            id: Number(idTema),
          },
        });

        if (!temaExiste) {
          res.status(404).json({
            message: "El tema no existe",
          });
          return
        }

        const ruleta = await prisma.ruleta.create({
          data: {
            pregunta1: pregunta1,
            pregunta2: pregunta2,
            pregunta3: pregunta3,
            pregunta4: pregunta4,
            pregunta5: pregunta5
          },
        });

        await prisma.juegos.create({
          data: {
            idTema: Number(idTema),
            nombreJuego: "El dado de las preguntas",
            idJuego: ruleta.id,
          },
        });

        res.json({
          message: "El juego fue agregado con exito",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

router.post("/respuestaRuleta", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const {pregunta, respuesta, id} = req.body;
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

        if (rj.nombreJuego === "Ruleteando") {
          await prisma.res_ruleta.create({
            data: {
              idDado: Number(rj.idJuego),
              pregunta: pregunta,
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

export default router;
