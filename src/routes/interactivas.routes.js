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

        const nivel = await prisma.p_interactivas.findUnique({
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

router.post("/agregarHistoria", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { parrafo, pregunta, claveA, claveB, claveC, idTema } = req.body;

        const tem = await prisma.temas.count({
          where: {
            id: Number(idTema),
          },
        });

        if (!tem) {
          res.status(404).json({
            message: "El tema no existe o ha sido borrado",
          });
          return;
        }

        const historia = await prisma.p_interactivas.create({
          data: {
            parrafo: parrafo,
            pregunta: pregunta,
            claveA: claveA,
            claveB: claveB,
            claveC: claveC,
          },
        });

        const juego = await prisma.juegos.create({
          data: {
            idTema: Number(idTema),
            nombreJuego: "Historias interactivas",
            idJuego: historia.id,
          },
        });

        res.json({
          message: "Historia creada",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
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

        if (rj.nombreJuego === "Historias interactivas") {
          await prisma.res_interactivas.create({
            data: {
              idInteractiva: Number(rj.idJuego),
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
    return res.status(500).json({
      message: "Error",
    });
  }
});

export default router;
