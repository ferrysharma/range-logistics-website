import { ArrowUpRight } from "lucide-react";
import { socialProfiles } from "@/lib/company";

const names = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn" };

export function SocialLinks() {
  // No guessed handles, unrelated businesses, or links to generic platform homepages.
  if (!socialProfiles.length) return null;
  return <div className="social-links" aria-label="Range Logistics social profiles">{socialProfiles.map((profile) => <a key={profile.platform} href={profile.url} target="_blank" rel="noopener noreferrer" aria-label={`Range Logistics on ${names[profile.platform]}: ${profile.handle}`}>
    <strong>{names[profile.platform]}</strong>
    <span>{profile.handle}</span>
    <ArrowUpRight size={15} aria-hidden="true" />
  </a>)}</div>;
}
