import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

// Pestaña de Modulos
// Cursos del docente
router.get("/cursosDocente", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Hubo un error en el token",
        });
      } else {
        const docente = payload.id;
        const cursos = await prisma.docente.findMany({
          where: {
            id: Number(docente),
          },
          select: {
            cursos: {
              select: {
                id: true,
                nombre: true,
                docente: {
                  select: {
                    nombre: true,
                    apaterno: true,
                  },
                },
              },
            },
          },
        });
        res.json({
          message: "cursos registrados",
          cursos: cursos,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

//Mostrar los cursos del alumno
//Alumnos
router.get("/cursosAlumno", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Hubo un error en el token",
        });
      } else {
        const alumno = payload.id;
        const aluc = await prisma.alumnos.findMany({
          where: {
            id: Number(alumno),
          },
          select: {
            matriculas: {
              select: {
                cursos: {
                  select: {
                    id: true,
                    nombre: true,
                    docente: {
                      select: {
                        nombre: true,
                        apaterno: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        res.json({
          message: "Cursos del alumno:",
          cursos: aluc,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

// Alumnos del curso
// Alumnos y docentes
router.get("/alumnosdelCurso", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Hubo un error en el token",
        });
      } else {
        const { id } = req.body;

        const cs = await prisma.cursos.findFirst({
          where: {
            id: Number(id),
          },
        });

        if (!cs) {
          return res.status(404).json({
            message: "El curso no existe",
          });
        }

        const verAlumnos = await prisma.cursos.findMany({
          where: {
            id: Number(id),
          },
          include: {
            matriculas: {
              select: {
                alumnos: {
                  select: {
                    nombre: true,
                    apaterno: true,
                    amaterno: true,
                  },
                },
              },
            },
          },
        });

        res.json({
          message: "cursos registrados",
          cursos: verAlumnos,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

//DE AQUI EN ADELANTE TODO ES PARA DOCENTES

router.post("/crearCurso", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const resultado = await prisma.docente.findUnique({
          where: {
            id: Number(payload.id),
          },
        });

        if (!resultado) {
          res.status(404).json({
            message: "El docente no existe o borro la cuenta",
          });
          return;
        } else {
          const { nombre, descripcion } = req.body;
          await prisma.cursos.create({
            data: {
              nombre: nombre,
              descripcion: descripcion,
              idDocente: Number(payload.id),
            },
          });
          res.json({
            message: "El curso se creo con exito",
          });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

router.put("/actualizarCurso", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id, nombre, descripcion } = req.body;

        const curso = await prisma.cursos.findUnique({
          where: {
            id: Number(id),
            idDocente: Number(payload.id),
          },
        });

        if (!curso) {
          res.status(404).json({
            message:
              "El usuario no es docente del curso y/o el curso no existe",
          });
          return;
        }

        await prisma.cursos.update({
          where: { id: Number(id) },
          data: {
            nombre: nombre,
            descripcion: descripcion,
          },
        });

        res.json({
          message: "Curso actualizado con exito",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

router.delete("/eliminarCurso", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const { id } = req.body;

        const existeCurso = await prisma.cursos.findFirst({
          where: {
            id: Number(id),
          },
        });

        if (!existeCurso) {
          res.status(404).json({
            message: "El curso no existe o ya ha sido borrado",
          });
        }

        await prisma.cursos.delete({
          where: {
            id: Number(id),
          },
        });
        res.json({
          message: "El curso ha sido borrado con éxito",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

export default router;
