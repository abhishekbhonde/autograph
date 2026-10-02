// Unknown URL
export const notFound = (req, res) => {
    res.status(404).json({ message: "Route not found" });
};

// Any error that reaches here. Needs 4 arguments so Express treats it as an error handler.
export const errorHandler = (err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Request body is not valid JSON" });
    }
    if (err.type === "entity.too.large") {
        return res.status(413).json({ message: "Request body too large" });
    }
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
};
