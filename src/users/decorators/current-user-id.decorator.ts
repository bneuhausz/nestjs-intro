import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentuserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.sub;
  }
);