const express = require("express")
const router = express.Router()

const Project = require("../models/Project")

router.post("/", async (req, res) => {

    try {

        const { name, files } = req.body

        const project = await Project.create({
            name,
            files,
        })

        res.status(201).json(project)

    } catch (error) {

        res.status(500).json({
            message: error.message,
        })
    }
})

router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().sort({
            updatedAt: -1,
        })

        res.json(projects)
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
})

router.get("/:id", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            })
        }

        res.json(project)
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
})

router.put("/:id", async (req, res) => {

    try {

        const updateData = req.body;

        const updatedProject =
            await Project.findByIdAndUpdate(
                req.params.id,
                updateData,
                {
                    returnDocument: "after",
                }
            );

        res.json(updatedProject);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id)

        res.json({
            message: "Project deleted",
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
})

module.exports = router