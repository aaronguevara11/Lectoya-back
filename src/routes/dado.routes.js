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

        const nivel = await prisma.preguntas_dado.findUnique({
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

router.post("/agregarDado", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const {
          primera_pre,
          segunda_pre,
          tercera_pre,
          cuarta_pre,
          quinta_pre,
          sexta_pre,
          idTema,
        } = req.body;

        const temaExiste = await prisma.temas.findUnique({
          where: {
            id: Number(idTema),
          },
        });

        if (!temaExiste) {
          res.status(404).json({
            message: "El tema no existe",
          });
          return;
        }

        const dado = await prisma.preguntas_dado.create({
          data: {
            primera_pre: primera_pre,
            segunda_pre: segunda_pre,
            tercera_pre: tercera_pre,
            cuarta_pre: cuarta_pre,
            quinta_pre: quinta_pre,
            sexta_pre: sexta_pre,
          },
        });

        await prisma.juegos.create({
          data: {
            idTema: Number(idTema),
            nombreJuego: "El dado de las preguntas",
            idJuego: dado.id,
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

router.post("/respuestaDado", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { pregunta, respuesta, id } = req.body;
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

        if (rj.nombreJuego === "El dado de las preguntas") {
          await prisma.respuesta_dado.create({
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
