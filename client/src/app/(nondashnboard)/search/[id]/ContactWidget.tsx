import { Button } from "@/components/ui/button";
import { useGetAuthUserQuery } from "@/state/api";
import { Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface ContactWidgetProps {
  onOpenModal: () => void;
  applied?: number;
}
const ContactWidget = ({ onOpenModal,applied }: ContactWidgetProps) => {
  const { data: authUser } = useGetAuthUserQuery();
  const router = useRouter();
  const handleButtonClick = () => {
    if (authUser) {
      onOpenModal();
    } else {
      router.push("/signin");
    }
  };

  return (
    <div className="bg-white border border-primary-200 rounded-2xl p-7 h-fit min-w-[300px]">
      {/* Contact Property */}
      <div className="flex items-center gap-5 mb-4 border border-primary-200 p-4 rounded-xl">
        <div className="flex items-center p-4 bg-secondary-900 rounded-full">
          <Phone className="text-black-50" size={15} />
        </div>
        <div>
          <p>Contact This Property</p>
          <div className="text-lg font-bold text-red-800">
            (424) 340-5574
          </div>
        </div>
      </div>
      <Button
        className="w-full bg-secondary-700/80 bg-amber-400 text-white hover:bg-primary-500/80"
        onClick={handleButtonClick} disabled={(applied || 0>0)?true:false}
      >
        {authUser ? applied ? "Already Applied" : "Submit Application" : "Sign In to Apply"}
      </Button>

      <hr className="my-4" />
      <div className="text-sm">
        <div className="text-secondary-600 mb-1">Language: English, Bahasa.</div>
        <div className="text-secondary-600">
          Open by appointment on Monday - Sunday
        </div>
      </div>
    </div>
  );
};

export default ContactWidget;
