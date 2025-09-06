import z from "zod";

const UserSchema = z.object({
    uuid: z.string("UUID is required"),
    email: z.email().optional().nullable(),
    manufacturer: z.string().optional(),
    device_model: z.string().optional(),
    os: z.string().optional(),
    os_version: z.string().optional(),
    is_virtual: z.boolean().optional(),
    last_ip: z.ipv4().optional().nullable(),
    lang: z.enum(["id", "en"]).optional().nullable(),
    domain: z.string().length(4).optional().nullable(),
});

const UpdateUserPayload = UserSchema.extend({
    new_version: z.boolean().optional().nullable(),
    is_virtual: z.boolean().optional().nullable(),
    email: z.email().optional().nullable(),
    manufacturer: z.string().optional().nullable(),
    device_model: z.string().optional().nullable(),
    os: z.string().optional().nullable(),
    os_version: z.string().optional().nullable(),
    fcm_token: z.string().optional().nullable(),
    lang: z.string().optional().nullable(),
    sign_up_type: z.number().optional().nullable(),
});

export default UserSchema;
export { UpdateUserPayload };