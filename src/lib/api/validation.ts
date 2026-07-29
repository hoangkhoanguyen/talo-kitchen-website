import z from "zod";
import { createInvalidInputs } from "./response";
// import { NextRequest } from "next/server";
// import { ADMIN_KEYS } from "@/constants/key";

export function validateRequestInputs<T>(
  schema: z.ZodSchema<T>,
  inputs: unknown,
) {
  const { data, error } = schema.safeParse(inputs);
  if (!error) throw createInvalidInputs();

  return data as T;
}

// export async function validateToken(req: NextRequest) {
//   try {
//     const token = req.cookies.get(ADMIN_KEYS.accessToken)?.value;

//     if (!token) throw createUnauthenticatedError();

//     const { payload, isExpired, isValid } = await verifyAccessToken(token);

//     console.log("isExpired, isValid", isExpired, isValid);

//     if (isExpired)
//       throw createAuthError({
//         code: 2,
//         message: "Expired Token",
//       });

//     if (!isValid || !payload) throw createUnauthenticatedError();

//     return payload;
//   } catch (error) {
//     console.log("authe rorororor", error);
//     throw error;
//   }
// }
