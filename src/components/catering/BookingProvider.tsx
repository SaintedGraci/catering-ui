import { createContext, useContext, useState, ReactNode } from "react";
import BookingDialog from "./BookingDialog";

const Ctx = createContext<{ open: () => void } | null>(null);

export const useBooking = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBooking outside provider");
  return c;
};

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <BookingDialog open={open} onOpenChange={setOpen} />
    </Ctx.Provider>
  );
};
