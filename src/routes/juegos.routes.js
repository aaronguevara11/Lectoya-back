import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient({
  log: ["query"],
});

router.get("/buscarJuego/:id", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const id = req.params.id;
        const juego = await prisma.juegos.findFirst({
          where: {
            id: Number(id),
          },
          select: {
            idJuego: true,
            nombreJuego: true,
          },
        });

        if(!juego) {
          res.status(404).json({
            message: "El juego no existe o ya ha sido borrado"
          })
          return
        }

        if (juego.nombreJuego === "Historias interactivas") {
          const nivel = await prisma.p_interactivas.findUnique({
            where: {
              id: Number(juego.idJuego),
            },
          });
          res.json({
            message: "Juegos",
            juego: nivel,
          });
        } else if (juego.nombreJuego === "¿Ahora que haremos?") {
          const nivel = await prisma.haremos.findUnique({
            where: {
              id: Number(juego.idJuego),
            },
          });

          res.json({
            message: "Juegos",
            juego: nivel,
          });
        } else if (juego.nombreJuego === "El dado de las preguntas") {
          const nivel = await prisma.preguntas_dado.findUnique({
            where: {
              id: Number(juego.idJuego),
            },
          });
          res.json({
            message: "Juegos",
            juego: nivel,
          });
        } else if (juego.nombreJuego === "Cambialo YA") {
          const nivel = await prisma.cambialo.findUnique({
            where: {
              id: Number(juego.idJuego)
            }
          })
          res.json({
            message: "Juegos",
            juego: nivel
          })
        } else if (juego.nombreJuego === "Ordenalo YA") {
          const nivel = await prisma.ordenalo.findUnique({
            where: {
              id: Number(juego.idJuego)
            }
          })
          res.json({
            message: "Juegos",
            juego: nivel
          })
        } else if (juego.nombreJuego === "Ruleteando") {
          const nivel = await prisma.ruleta.findUnique({
            where: {
              id: Number(juego.idJuego)
            }
          })
          res.json({
            message: "Juegos", 
            juego: nivel
          })
        } else if (juego.nombreJuego === "Dale un significado") {
          const nivel = await prisma.dale_significado.findUnique({
            where: {
              id: Number(juego.idJuego)
            }
          })
          
          res.json({
            message: "Juegos",
            juego: nivel
          })
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

router.get("/verRespuesta/:id", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const id = req.params.id;
        const juego = await prisma.juegos.findFirst({
          where: {
            id: Number(id),
          },
          select: {
            idJuego: true,
            nombreJuego: true,
          },
        });

        if(!juego) {
          res.status(404).json({
            message: "El juego no existe o ya ha sido borrado"
          })
          return
        }

        if (juego.nombreJuego === "Historias interactivas") {
          const nivel = await prisma.p_interactivas.findUnique({
            where: {
              id: Number(juego.idJuego),
            },
            include: {
              resInteractivas: true
            }
          });
          res.json({
            message: "Juegos",
            juego: nivel,
          });
        } else if (juego.nombreJuego === "¿Ahora que haremos?") {
          const nivel = await prisma.haremos.findUnique({
            where: {
              id: Number(juego.idJuego),
            },
            include: {
              res_haremos: true
            }
          });

          res.json({
            message: "Juegos",
            juego: nivel,
          });
        } else if (juego.nombreJuego === "El dado de las preguntas") {
          const nivel = await prisma.preguntas_dado.findUnique({
            where: {
              id: Number(juego.idJuego),
            },
            include: {
              respuesta_dado: true
            }
          });
          res.json({
            message: "Juegos",
            juego: nivel,
          });
        } else if (juego.nombreJuego === "Cambialo YA") {
          const nivel = await prisma.cambialo.findUnique({
            where: {
              id: Number(juego.idJuego)
            },
            include: {
              res_cambialo: true
            }
          })
          res.json({
            message: "Juegos",
            juego: nivel
          })
        } else if (juego.nombreJuego === "Ordenalo YA") {
          const nivel = await prisma.ordenalo.findUnique({
            where: {
              id: Number(juego.idJuego)
            },
            include: {
              res_ordenalo: true
            }
          })
          res.json({
            message: "Juegos",
            juego: nivel
          })
        } else if (juego.nombreJuego === "Ruleteando") {
          const nivel = await prisma.ruleta.findUnique({
            where: {
              id: Number(juego.idJuego)
            },
            include: {
              res_ruleta: true
            }
          })
          res.json({
            message: "Juegos", 
            juego: nivel
          })
        } else if (juego.nombreJuego === "Dale un significado") {
          const nivel = await prisma.dale_significado.findUnique({
            where: {
              id: Number(juego.idJuego)
            },
            include: {
              res_significado: true
            }
          })
          
          res.json({
            message: "Juegos",
            juego: nivel
          })
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

router.delete("/borrarJuegos", async (req, res) => {
  try {
    const token = req.header("Authorization");
    jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
      if (err) {
        res.json({
          message: "Error en el token",
        });
      } else {
        const {id} = req.body;
        const juego = await prisma.juegos.findFirst({
          where: {
            id: Number(id),
          },
          select: {
            idJuego: true,
            nombreJuego: true,
          },
        });

        if(!juego) {
          res.status(404).json({
            message: "El juego no existe o ya ha sido borrado"
          })
          return
        }

        if (juego.nombreJuego === "Historias interactivas") {
          const nivel = await prisma.p_interactivas.delete({
            where: {
              id: Number(juego.idJuego),
            },
          });

          await prisma.juegos.delete({
            where:{
              id: Number(id)
            }
          })
          res.json({
            message: "El juego ha sido borrado con exito",
          });
        } else if (juego.nombreJuego === "¿Ahora que haremos?") {
          const nivel = await prisma.haremos.delete({
            where: {
              id: Number(juego.idJuego),
            },
          });

          await prisma.juegos.delete({
            where:{
              id: Number(id)
            }
          })
          res.json({
            message: "El juego ha sido borrado con exito",
          });
        } else if (juego.nombreJuego === "El dado de las preguntas") {
          const nivel = await prisma.preguntas_dado.delete({
            where: {
              id: Number(juego.idJuego),
            },
          });

          await prisma.juegos.delete({
            where:{
              id: Number(id)
            }
          })
          res.json({
            message: "El juego ha sido borrado con exito",
          });
        } else if (juego.nombreJuego === "Cambialo YA") {
          const nivel = await prisma.cambialo.delete({
            where: {
              id: Number(juego.idJuego)
            },
          })

          await prisma.juegos.delete({
            where:{
              id: Number(id)
            }
          })
          res.json({
            message: "El juego ha sido borrado con exito",
          })
        } else if (juego.nombreJuego === "Ordenalo YA") {
          const nivel = await prisma.ordenalo.delete({
            where: {
              id: Number(juego.idJuego)
            },
          })

          await prisma.juegos.delete({
            where:{
              id: Number(id)
            }
          })
          res.json({
            message: "El juego ha sido borrado con exito",
          })
        } else if (juego.nombreJuego === "Ruleteando") {
          const nivel = await prisma.ruleta.delete({
            where: {
              id: Number(juego.idJuego)
            },
          })

          await prisma.juegos.delete({
            where:{
              id: Number(id)
            }
          })
          res.json({
            message: "El juego ha sido borrado con exito",
          })
        } else if (juego.nombreJuego === "Dale un significado") {
          const nivel = await prisma.dale_significado.delete({
            where: {
              id: Number(juego.idJuego)
            },
          })
          

          await prisma.juegos.delete({
            where:{
              id: Number(id)
            }
          })
          res.json({
            message: "El juego ha sido borrado con exito",
          })
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en el servidor",
    });
  }
});

export default router;
