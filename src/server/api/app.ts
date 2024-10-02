import { appModel } from "@/prisma/models";

const getAppIdBySlug = (slug) => {
  return appModel.findUnique({
    where: {
      slug
    },
    select: {
      id: true
    }
  });
}

export {
  getAppIdBySlug
}