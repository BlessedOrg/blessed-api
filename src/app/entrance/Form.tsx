"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { entranceEntry } from "@/server/api/entranceChecker/entranceEntry";
import { toast } from "react-toastify";
import { Button, TextInput } from "flowbite-react";
import Image from "next/image";

export const EntranceForm = () => {
  const [enteredToEvent, setEnteredToEvent] = useState(false);
  const [enteredTimestamp, setEnteredTimestamp] = useState(null);
  const searchParams = useSearchParams();
  const [enteredEmail, setEnteredEmail] = useState("");
  const onEmailChange = (e) => setEnteredEmail(e.target.value);
  const contractAddress = searchParams.get("contractAddress");

  const onSubmit = async () => {
    try {
      const res = await entranceEntry(enteredEmail, contractAddress);
      if (res?.error) {
        toast(`Something went wrong: ${res.error}`, { type: "error" });
        return;
      }
      if (res?.message && !res?.txHash) {
        toast(res.message, { type: "warning" });
        setEnteredTimestamp(res.enteredTimestamp);
        setEnteredToEvent(true);
      } else {
        toast("Successfully entered", { type: "success" });
        setEnteredTimestamp(res.enteredTimestamp);
        setEnteredToEvent(true);
      }
      setEnteredEmail("");
    } catch (e) {
      console.log(e);
      toast(`Something went wrong: ${e?.message}`, { type: "error" });
    }
  };
  const enteredDate = new Date(enteredTimestamp || 0);

  return (
    <div className="flex w-full h-[100vh] items-center justify-center">
      {enteredToEvent && (
        <p>
          Successfully entered to event at: {enteredDate.toLocaleDateString()} -{" "}
          {enteredDate.toLocaleTimeString()}
        </p>
      )}
      {!!contractAddress && !enteredToEvent && (
        <div className={"flex flex-col gap-2"}>
          <p>Enter email to join the event</p>
          <TextInput
            onChange={onEmailChange}
            value={enteredEmail}
            type={"email"}
            addon={"@"}
            placeholder={"Enter email"}
          />
          <Button onClick={onSubmit}>Submit</Button>
        </div>
      )}
      {!contractAddress && (
        <Image
          src={
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANQAAADUCAYAAADk3g0YAAAAAklEQVR4AewaftIAAAqASURBVO3BQY4YybLgQDJR978yR0tfBZDIKKn/GzezP1hrXfGw1rrmYa11zcNa65qHtdY1D2utax7WWtc8rLWueVhrXfOw1rrmYa11zcNa65qHtdY1D2utax7WWtc8rLWu+eEjlb+p4kTlpGJSOamYVE4qTlSmikllqnhDZap4Q+Wk4kRlqjhRmSomlb+p4ouHtdY1D2utax7WWtf8cFnFTSpvVEwqb1R8oXJSMalMFZPKGxWTyhsVv0llqnij4iaVmx7WWtc8rLWueVhrXfPDL1N5o+INlS8qTlSmiknli4pJZaqYVL6omFQmlZOKSeVfUnmj4jc9rLWueVhrXfOw1rrmh/8xFW+ovKFyk8pUMal8UTGpTBWTyonKVPGFylTxf9nDWuuah7XWNQ9rrWt++B+nMlW8UXGTyonKFypTxb+k8v+Th7XWNQ9rrWse1lrX/PDLKv4mlaliUpkqJpUTlaniRGWqmFSmijdUvlA5qXhDZar4TRX/JQ9rrWse1lrXPKy1rvnhMpV/qWJSmSomlaliUpkqJpWp4iaVqeKkYlKZKiaVqWJSmSomlaliUpkqJpWp4kTlv+xhrXXNw1rrmoe11jU/fFTxX1YxqZyoTBWTylQxqZyovFHxRcWk8oXKGxVfVPxf8rDWuuZhrXXNw1rrmh8+UpkqJpWbKqaKSeWLii8qJpWpYlKZVH5TxaTyRsWJyknFVHGiclPFb3pYa13zsNa65mGtdc0PH1VMKlPFpDJV/JepnKh8UTGpTBUnKm+oTBWTyhsqU8WJyknFGxWTylQxqZxUfPGw1rrmYa11zcNa65ofLquYVKaKSeWLit9UMalMFZPKVPGFyknFTRUnKlPFGxUnKn9TxU0Pa61rHtZa1zysta6xP/gPUZkqJpU3Kt5QOamYVKaKE5WTii9UpopJ5YuKSWWqOFF5o+JE5Y2K3/Sw1rrmYa11zcNa65ofPlKZKiaVqeINlaliUpkqJpWpYlI5qZhUpopJ5aRiUplU3qj4omJSOVGZKiaVqeKk4g2VqeILlanii4e11jUPa61rHtZa1/xwmcpUMamcVJyonKh8UTGpvFFxovJGxRsVb6hMFZPKVDGpTBVvqJxUTBWTylQxqUwVv+lhrXXNw1rrmoe11jX2BxepfFExqUwVb6hMFScqJxUnKl9UnKjcVDGpTBVvqEwVk8pUMamcVLyhclJx08Na65qHtdY1D2uta374SGWqmFSmikllUpkqvqiYVKaKk4pJ5YuKE5WpYqq4SeVE5aTijYpJ5aRiUjmp+Jce1lrXPKy1rnlYa13zwy+rOKk4UZkqJpWTiqnipOKLiknljYo3VE4qJpWp4kTlRGWqmFSmipOKSWWqOFGZKv6mh7XWNQ9rrWse1lrX/PBRxRsqU8WkMlW8UXGiclIxqUwVk8qkMlVMKlPFicpUMVVMKjdVnKhMKlPFFxWTyhsqb1R88bDWuuZhrXXNw1rrGvuDi1TeqDhRmSpOVN6omFTeqDhRmSomlZsqJpWp4g2VNyomlaniROWk4kTlpOI3Pay1rnlYa13zsNa65ofLKiaVN1SmiknlpGJSmSomlTcq3qiYVKaK31RxojJVnFRMKpPKVHGiclJxojJVTCp/08Na65qHtdY1D2uta+wPLlKZKiaV31RxovKbKiaVv6niC5WpYlKZKiaV/5KKv+lhrXXNw1rrmoe11jU/fKRyovJGxRsqk8obFTepTBUnKlPFGypvqEwVJypfVEwqJxVvqJyovFHxxcNa65qHtdY1D2uta364rOINlROVqeKkYlKZKk5UTir+JpWp4m+qOFGZKiaVqWJSOVGZKk4qJpWp4jc9rLWueVhrXfOw1rrmh79M5Y2Km1TeqJhUpoqp4qaKmypOKiaVqeJvqnhD5URlqrjpYa11zcNa65qHtdY1P3xU8UbFpDKpfKFyUjGpfKFyUvGGyk0qJxUnFZPKVHGTyk0Vk8pvelhrXfOw1rrmYa11zQ8fqUwVN1VMKlPFFxVfVJyovFExqUwVk8oXKm9UTCpvqEwVJypTxRsqU8WkMlV88bDWuuZhrXXNw1rrmh/+MpWTiknlDZUvKiaVN1Smii8qTiomlZOKmypOVKaKSeWkYlJ5o2JSmSpuelhrXfOw1rrmYa11zQ8fVUwqU8VJxaQyVUwqN1WcVJyonKicVEwqU8WkclIxqXyh8kXFpDJVnKhMFZPKicpU8Zse1lrXPKy1rnlYa13zw3+cylQxqUwVk8pUMalMFZPKVHFS8YbKGxVvVEwqU8VJxaQyVbxRMam8oXJScaIyVdz0sNa65mGtdc3DWusa+4MPVN6ouEllqjhR+aLib1J5o+JEZaqYVE4qfpPKGxWTyhcVXzysta55WGtd87DWusb+4CKV/5KKN1ROKiaVqWJSmSomlZOKSeWmijdUpopJ5aRiUvmiYlI5qfhND2utax7WWtc8rLWu+eGyiknljYo3VL5Q+aJiUpkqTipOVKaKSeWkYlKZVKaKSWWqmFSmihOVqeJE5TepTBVfPKy1rnlYa13zsNa6xv7gH1KZKiaVqeJEZaqYVE4qJpU3Kt5QOamYVE4qvlB5o+JfUpkq/qWHtdY1D2utax7WWtf88JHKVHFTxaQyVUwVk8pJxRcVk8pUMalMFScqU8Wk8obKVPEvqUwVk8pJxRsqJxVfPKy1rnlYa13zsNa65oePKn6TyonKVHFS8UbFTRWTylRxojJVTCpfVHyhclIxVUwqU8WJyhsVv+lhrXXNw1rrmoe11jX2BxepfFHxL6m8UfGGylQxqZxUTCpvVEwqU8Wk8kbFicpUcaJyUnGiMlX8poe11jUPa61rHtZa19gffKAyVZyonFRMKlPFpHJSMamcVEwqU8VNKjdVTConFZPKVPGGylQxqfxNFX/Tw1rrmoe11jUPa61r7A/+D1M5qbhJZar4QmWqeEPljYo3VKaKE5WpYlI5qXhD5Y2KSWWq+OJhrXXNw1rrmoe11jU/fKTyN1VMFScqU8VvUpkqJpU3VKaKk4o3VE4q3qiYVL5QmSpOKiaVSWWquOlhrXXNw1rrmoe11jX2Bx+oTBU3qUwVk8pUcZPKVDGp3FTxhspJxaQyVUwqN1VMKicVb6jcVPHFw1rrmoe11jUPa61rfvhlKm9U3KRyUjGp/KaKSWVS+aLiDZU3Kr6omFQmlZsq/qaHtdY1D2utax7WWtf88D+uYlK5qeKLihOVN1SmipOKE5VJZaqYVN6oeEPlv+xhrXXNw1rrmoe11jU//I9TOVE5qThROamYVKaKSWWqOFH5QuWkYlI5qXhDZao4qThR+Zce1lrXPKy1rnlYa13zwy+r+E0VJxVfqEwVU8UXKlPFGxVvVLyhMlVMKlPFicoXKlPFicpU8Zse1lrXPKy1rnlYa13zw2Uqf5PKVDGpvFFxovJGxUnFpDJVTConFScqU8WkMlVMKlPFpDJVTBWTyqRyUnFScaIyVdz0sNa65mGtdc3DWusa+4O11hUPa61rHtZa1zysta55WGtd87DWuuZhrXXNw1rrmoe11jUPa61rHtZa1zysta55WGtd87DWuuZhrXXNw1rrmv8HOSXArKEHfV0AAAAASUVORK5CYII="
          }
          alt={"qr"}
          width={200}
          height={200}
        />
      )}
    </div>
  );
};
