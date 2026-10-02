export const ENGINE_VERSION = 1; // bump when the drawing engine changes
export const STYLES = ["scripts", "scriptc", "timesi", "futural", "gothiceng"];
export const ID_PATTERN = /^[A-Za-z0-9_-]{8}$/;

const NAME_PATTERN = /^[A-Za-z0-9 .,'\-!?&]+$/;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const RANGES = {
    pen: [0.5, 3],
    ps: [0, 1],
    slant: [-20, 30],
    shake: [0, 2],
    rise: [0, 12],
    sp: [0.8, 1.4],
};

const isObject = (value) =>
    typeof value === "object" && value !== null && !Array.isArray(value);

// Checks the request body. Returns a list of error messages
// and, if everything is fine, a clean value to save.
export const validateSignature = (body) => {
    const errors = [];

    if (!isObject(body)) {
        return { errors: ["Request body must be a JSON object"] };
    }

    for (const key of Object.keys(body)) {
        if (!["name", "style", "seed", "settings"].includes(key)) {
            errors.push(`Unknown field: ${key}`);
        }
    }

    const name = typeof body.name === "string" ? body.name.trim() : null;
    if (name === null) {
        errors.push("name must be a string");
    } else if (name.length < 1 || name.length > 40) {
        errors.push("name must be 1 to 40 characters");
    } else if (!NAME_PATTERN.test(name)) {
        errors.push("name has unsupported characters");
    }

    if (!STYLES.includes(body.style)) {
        errors.push(`style must be one of: ${STYLES.join(", ")}`);
    }

    if (!Number.isInteger(body.seed) || body.seed < 0 || body.seed > 10000) {
        errors.push("seed must be a whole number from 0 to 10000");
    }

    const s = body.settings;
    if (!isObject(s)) {
        errors.push("settings must be an object");
    } else {
        const allowed = [...Object.keys(RANGES), "flo", "ink"];
        for (const key of Object.keys(s)) {
            if (!allowed.includes(key)) errors.push(`Unknown setting: ${key}`);
        }
        for (const [key, [min, max]] of Object.entries(RANGES)) {
            // written this way so NaN also fails
            if (typeof s[key] !== "number" || !(s[key] >= min && s[key] <= max)) {
                errors.push(`settings.${key} must be a number from ${min} to ${max}`);
            }
        }
        if (typeof s.flo !== "boolean") {
            errors.push("settings.flo must be true or false");
        }
        if (typeof s.ink !== "string" || !HEX_COLOR.test(s.ink)) {
            errors.push("settings.ink must be a hex colour like #14213d");
        }
    }

    if (errors.length > 0) return { errors };

    return {
        errors,
        value: {
            name,
            style: body.style,
            seed: body.seed,
            settings: {
                pen: s.pen, ps: s.ps, slant: s.slant, shake: s.shake,
                rise: s.rise, sp: s.sp, flo: s.flo, ink: s.ink,
            },
        },
    };
};
