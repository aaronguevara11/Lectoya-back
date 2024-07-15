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

        const nivel = await prisma.ordenalo.findUnique({
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

router.post("/agregarOrdenalo", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { parrafo1, parrafo2, parrafo3, parrafo4, parrafo5, idTema } =
          req.body;

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

        const ordenalo = await prisma.ordenalo.create({
          data: {
            parrafo1: parrafo1,
            parrafo2: parrafo2,
            parrafo3: parrafo3,
            parrafo4: parrafo4,
            parrafo5: parrafo5,
          },
        });

        await prisma.juegos.create({
          data: {
            idTema: Number(idTema),
            nombreJuego: "Ordenalo YA",
            idJuego: ordenalo.id,
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

router.post("/agregarRespuesta", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { orden1, orden2, orden3, orden4, orden5, id } = req.body;
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

        if (rj.nombreJuego === "Ordenalo YA") {
          await prisma.res_ordenalo.create({
            data: {
              idOrdenalo: Number(rj.idJuego),
              orden1: orden1,
              orden2: orden2,
              orden3: orden3,
              orden4: orden4,
              orden5: orden5,
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

router.post("/enviarRespuesta", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { orden1, orden2, orden3, orden4, orden5, id } = req.body;
        const idAlumno = payload.id;
        const nombre = payload.nombre;
        const apellido = payload.apaterno;

        const nivel = await prisma.ordenalo.findUnique({
          where: {
            id: Number(id),
          },
        });

        if (!nivel) {
          res.json({
            message: "El nivel no existe",
          });
        }

        await prisma.res_ordenalo.create({
          data: {
            id: Number(id),
            orden1: orden1,
            orden2: orden2,
            orden3: orden3,
            orden4: orden4,
            orden5: orden5,
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
    return res.status(500).json({
      message: "Error",
    });
  }
});

export default router;
