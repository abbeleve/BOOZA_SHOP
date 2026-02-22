import type { Link } from "@/types/header";
import Logo from "./Logo";

interface FooterProps {
    mainLinks: Link[];
    additionalLinks: Link[];
    mail: string,
    phoneNumber: string,
}

function Footer({mainLinks, additionalLinks, mail, phoneNumber}: FooterProps) {
    return (
        <footer className="flex flex-col gap-5 px-10 py-10 bg-gray-800 text-amber-50">
            <div className="flex flex-row w-full">
                <div className="flex flex-col w-1/2">
                    {mainLinks.map((link, index) => (
                        <a className="hover:text-textSecondary" key={index} href={link.link}>{link.label}</a>
                    ))}
                </div>
                <div className="flex flex-col w-1/2">
                    {additionalLinks.map((link, index) => (
                        <a className="hover:text-textSecondary" key={index} href={link.link}>{link.label}</a>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-5 items-start md:justify-between">
                <div>
                    <span>Обращения на почту: </span>
                    <h2 className="text-md break-all">{mail}</h2>
                </div>
                <h2>{phoneNumber}</h2>
                <Logo />
            </div>
        </footer>
    );
}

export default Footer;