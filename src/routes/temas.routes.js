import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

//Docentes
router.get("/verTema/:id", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const id = parseInt(req.params.id);

        const tema1 = await prisma.temas.findUnique({
          where: {
            id: Number(id),
          },
          select: {
            idCurso: true,
            id: true,
            nombre: true,
            lectura: true,
            juegos: {
              select: {
                id: true,
                nombreJuego: true,
              },
            },
          },
        });

        if (!tema1) {
          res.status(404).json({
            message: "El tema no existe",
          });
          return;
        }

        res.json({
          message: "Temas registrados: ",
          Temas: tema1,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

router.get("/detalleTema/:id", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const id = parseInt(req.params.id);

        const tema1 = await prisma.temas.findUnique({
          where: {
            id: Number(id),
          },
          select: {
            idCurso: true,
            id: true,
            nombre: true,
            lectura: true,
            juegos: {
              select: {
                id: true,
                idJuego: true,
                nombreJuego: true,
              },
            },
          },
        });

        if (!tema1) {
          res.status(404).json({
            message: "El tema no existe",
          });
          return;
        }

        res.json({
          message: "Temas registrados: ",
          Temas: tema1,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

router.get("/mostrarTemas/:id", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        return res.status(401).json({
          message: "Error en el token",
        });
      } else {
        const id = parseInt(req.params.id);

        const tema1 = await prisma.cursos.findUnique({
          where: {
            id: Number(id),
          },
          select: {
            temas: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
              },
            },
            matriculas: {
              select: {
                alumnos: {
                  select: {
                    nombre: true,
                    apaterno: true,
                  },
                },
              },
            },
          },
        });
        if (!tema1) {
          return res.status(404).json({
            message: "El tema no existe",
          });
        }
        return res.json({
          message: "Temas registrados: ",
          Tema: tema1,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

router.get("/mostrarAlumnos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const tema1 = await prisma.cursos.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        temas: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
        matriculas: {
          select: {
            alumnos: {
              select: {
                nombre: true,
                apaterno: true,
              },
            },
          },
        },
      },
    });
    if (!tema1) {
      return res.status(404).json({
        message: "El tema no existe",
      });
    }
    return res.json({
      message: "Temas registrados: ",
      Tema: tema1,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

router.post("/agregarTemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { idCurso, nombre, descripcion, lectura } = req.body;
        const docente = payload.id;

        const curso = await prisma.cursos.findUnique({
          where: {
            id: Number(idCurso),
            idDocente: Number(docente),
          },
        });

        if (!curso) {
          res.status(404).json({
            message: "El usuario no es docente del curso o el curso no existe",
          });
          return;
        }

        await prisma.temas.create({
          data: {
            idCurso: Number(idCurso),
            nombre: nombre,
            descripcion: descripcion,
            lectura: lectura,
          },
        });

        res.json({
          message: "Tema agregado con exito",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

router.put("/actualizarTemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id, nombre, descripcion, lectura } = req.body;

        const Existe = await prisma.temas.findUnique({
          where: {
            id: Number(id),
          },
        });

        if (!Existe) {
          return res.status(404).json({
            message: "El tema no existe",
          });
        }

        await prisma.temas.update({
          where: {
            id: Number(id),
          },
          data: {
            nombre: nombre,
            descripcion: descripcion,
            lectura: lectura,
          },
        });
        res.json({
          message: "Tema actualizado con exito",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

router.delete("/borrarTemas", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;

        const existeTema = await prisma.temas.findUnique({
          where: {
            id: Number(id),
          },
        });

        if (!existeTema) {
          return res.status(404).json({
            message: "El tema no existe",
          });
        }

        await prisma.temas.delete({
          where: {
            id: Number(id),
          },
        });

        res.json({
          message: "El tema se borro con exito",
        });
      }
    });
  } catch {
    res.json({
      message: "Error",
    });
  }
});

export default router;
