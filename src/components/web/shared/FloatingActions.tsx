import { ConfigValue } from "@/types/configs";
import CallToWhatsApp from "./CallToWhatsApp";
import ScrollToTopButton from "./ScrollToTopButton";

const FloatingActions = ({ configs }: { configs: ConfigValue }) => {
  return (
    <div className="fixed bottom-24 end-5 z-30">
      <div className="flex flex-col gap-5">
        {(configs.whatsAppCalling as any).showButton ? (
          <CallToWhatsApp
            phoneNumber={(configs.whatsAppCalling as any).phoneNumber}
          />
        ) : null}
        {configs.showScrollToTopButton ? <ScrollToTopButton /> : null}
      </div>
    </div>
  );
};

export default FloatingActions;
