import Icon from "@/components/common/Icon";
import { Link } from "@/i18n/navigation";

const CallToWhatsApp = ({ phoneNumber }: { phoneNumber: string }) => {
  return (
    <Link
      href={`https://wa.me/${phoneNumber}`}
      target="_blank"
      rel="noreferrer"
      className="block"
    >
      <Icon icon="logos:whatsapp-icon" className="h-14 w-14" />
    </Link>
  );
};

export default CallToWhatsApp;
