import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Transloadit } from "transloadit";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const authKey = process.env.TRANSLOADIT_KEY;
  const authSecret = process.env.TRANSLOADIT_SECRET;
  if (!authKey || !authSecret) {
    return NextResponse.json({ error: "Upload credentials not configured" }, { status: 500 });
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const tmpPath = join(tmpdir(), `${randomUUID()}.${ext}`);

  try {
    await writeFile(tmpPath, Buffer.from(await file.arrayBuffer()));

    const transloadit = new Transloadit({ authKey, authSecret });
    const assembly = await transloadit.createAssembly({
      files: { file: tmpPath },
      params: { steps: {} },
      waitForCompletion: true,
    });

    const upload = (assembly as any).uploads?.[0];
    const url: string | undefined = upload?.ssl_url || upload?.url;
    if (!url) throw new Error("Upload returned no URL");

    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}
