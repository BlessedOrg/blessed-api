import { appModel } from "@/models";

const getAppIdBySlug = (slug) => {
  return appModel.findUnique({
    where: {
      slug
    }
  });
}

export {
  getAppIdBySlug
}