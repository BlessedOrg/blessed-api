import { Card } from "@/components/Card";
import { CustomButton } from "@/components/CustomComponents";
import { useState } from "react";
import { useUserContext } from "@/store/UserContext";

export const ApiKeyTab = () => {
  const { ApiTokens } = useUserContext();
  const existingTokens = (ApiTokens || []).sort((a, b) =>
    new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime() ? -1 : 1
  );
  const [isGeneratingApiKey, setIsGeneratingApiKey] = useState(false);

  const onGenerateNewApiKey = () => {
    setIsGeneratingApiKey(true);
    try {
      // fake request 3s
      setTimeout(() => {
        setIsGeneratingApiKey(false);
      }, 3000);
    } catch (e) {}
  };
  return (
    <div className="w-full flex-col flex gap-4">
      <Card className="flex flex-col gap-4 w-full h-fit">
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-xl">Generate a new API key</h2>
          <Card className="!bg-secondary-500">
            <span className="font-semibold">Remember</span> You will only see the token once, so be sure to copy and
            store it securely when it's displayed.
          </Card>
        </div>
        <CustomButton onClick={onGenerateNewApiKey} isProcessing={isGeneratingApiKey} className="w-fit">
          Get new API key
        </CustomButton>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-xl">Existing API tokens</h2>
          <Card className="!bg-secondary-500">
            Here, you'll find a list of your existing API tokens. For security reasons, the actual tokens are not
            displayed. Revoking a token is immediate and cannot be undone. If you revoke a token by mistake, you will
            need to generate a new one.
          </Card>
        </div>
      </Card>
    </div>
  );
};
