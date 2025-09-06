import z from "zod";

const UserSchema = z.object({
    uuid: z.string("UUID is required"),
    email: z.email().optional().nullable(),
    manufacturer: z.string().optional(),
    device_model: z.string().optional(),
    os: z.string().optional(),
    os_version: z.string().optional(),
    is_virtual: z.boolean().optional(),
    last_ip: z.ipv4().optional(),
});

export default UserSchema;