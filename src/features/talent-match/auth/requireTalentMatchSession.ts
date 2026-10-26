import { redirect } from "@tanstack/react-router";
import {
  ensureTalentMatchSession,
  getTalentMatchSession,
  isAnonymousDemoAllowed,
} from "./talentMatchSupabaseClient";

export async function requireTalentMatchSession(pathname: string, search = "") {
  let session = await getTalentMatchSession();
  if (!session && isAnonymousDemoAllowed()) {
    await ensureTalentMatchSession();
    session = await getTalentMatchSession();
  }
  const isAnonymous = session?.user?.is_anonymous === true;

  if (!session || (isAnonymous && !isAnonymousDemoAllowed())) {
    const intendedPath = `${pathname}${search}`;
    throw redirect({
      href: `/talent-match/login?redirect=${encodeURIComponent(intendedPath)}`,
      replace: true,
    });
  }

  return session;
}
