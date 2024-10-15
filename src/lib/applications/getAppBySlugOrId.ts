import { appModel } from "@/models";

export const getAppBySlugOrId = async (slugOrId: string) => {
  return appModel.findFirst({
    where: {
      OR: [
        { id: slugOrId },
        { slug: slugOrId }
      ]
    },
    include: {
      DeveloperAccount: {
        select: {
          walletAddress: true
        }
      }
    }
  });
};