import { Suspense } from "react";
import { EntranceForm } from "@/app/entrance/Form";
export default function EntrancePage() {
  return (
    <Suspense>
      <EntranceForm />
    </Suspense>
  );
}
