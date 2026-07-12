import { NextResponse } from "next/server";

export class BaseController {
  protected json(data: any, status: number = 200) {
    return NextResponse.json(data, { status });
  }

  protected error(message: string, status: number = 400) {
    return NextResponse.json({ message }, { status });
  }
}
