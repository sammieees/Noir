export const ADMIN_EMAIL = "admin@noir.com";

export const getUserRole = (email) => {
    const cleanEmail = (email || "").trim().toLowerCase();

    if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
    return "admin";
    }

    return "customer";
};
