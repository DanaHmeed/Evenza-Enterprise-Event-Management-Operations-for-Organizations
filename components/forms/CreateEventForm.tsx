import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema } from "@/lib/validations/event.schema";

export function CreateEventForm() {
  const form = useForm({
    resolver: zodResolver(createEventSchema),
  });

  const onSubmit = async (data: any) => {
    await fetch("/api/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* inputs go here */}
    </form>
  );
}
