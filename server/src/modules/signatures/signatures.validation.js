export const ENGINE_VERSION = 1;
export const STYLES = [
    "brittany",
    "signatura",
    "delafield",
    "allura",
    "greatvibes",
    "sacramento",
    "parisienne",
    "scripts",
    "scriptc",
    "timesi",
    "futural",
    "gothiceng",
];
export const ID_PATTERN = /^[A-Za-z0-9_-]{8}$/;

const isObject = (value) =>
    typeof value === "object" && value !== null && !Array.isArray(value);

export const validateSignature = (body) => {
    const errors = [];

    if (!isObject(body)) {
        return { errors: ["Request body must be a JSON object"] };
    }

    const name = typeof body.name === "string" ? body.name.trim() : null;
    if (!name || name.length < 1 || name.length > 80) {
        errors.push("name must be 1 to 80 characters");
    }

    const style = typeof body.style === "string" ? body.style : "brittany";
    if (!STYLES.includes(style)) {
        errors.push(`style must be one of: ${STYLES.join(", ")}`);
    }

    const seed = Number.isInteger(body.seed) ? body.seed : 1234;

    const settings = isObject(body.settings) ? body.settings : {};

    if (errors.length > 0) return { errors };

    return {
        errors,
        value: {
            name,
            style,
            seed,
            settings,
        },
    };
};
