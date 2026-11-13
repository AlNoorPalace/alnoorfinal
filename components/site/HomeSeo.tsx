import Head from "next/head";

// The home page's search-engine block (title, meta tags, social tags and LocalBusiness data),
// supplied by the owner and kept exactly as written. Do not reword or reformat these values.

const JSON_LD = "\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"LocalBusiness\",\n  \"name\": \"Al NOOR RESIDENCY\",\n  \"image\": \"https://www.alnoorpalace.in/_next/image?url=%2Fimg%2Flogo-mark.png&w=48&q=75\",\n  \"@id\": \"https://www.alnoorpalace.in/\",\n  \"url\": \"https://www.alnoorpalace.in/\",\n  \"telephone\": \"073389 55111\",\n  \"address\": {\n    \"@type\": \"PostalAddress\",\n    \"streetAddress\": \"2nd Floor, 221/222, NSC Bose Rd, Parrys Corner, George Town,Tamil Nadu\",\n    \"addressLocality\": \"Chennai\",\n    \"postalCode\": \"600001\",\n    \"addressCountry\": \"IN\"\n  },\n  \"geo\": {\n    \"@type\": \"GeoCoordinates\",\n    \"latitude\": 13.08901,\n    \"longitude\": 80.28581\n  },\n  \"openingHoursSpecification\": {\n    \"@type\": \"OpeningHoursSpecification\",\n    \"dayOfWeek\": [\n      \"Monday\",\n      \"Tuesday\",\n      \"Wednesday\",\n      \"Thursday\",\n      \"Friday\",\n      \"Saturday\",\n      \"Sunday\"\n    ],\n    \"opens\": \"00:00\",\n    \"closes\": \"23:59\"\n  } \n}\n";

export default function HomeSeo() {
  return (
    <Head>
      <title>{"Hotels | Affordable Business Class Hotel in Chennai"}</title>
      <meta name={"description"} content={"Al Noor Residency budget friendly hotel offers premium stays in Chennai with comfortable rooms and welcoming hospitality for family and couple friendly travellers"} />
      <meta name={"keywords"} content={"business stay in chennai, budget friendly hotel in high court, hotel rooms in mannady, couple friendly hotels near parrys corner, family hostels near chennai central"} />
      <link rel={"canonical"} href={"https://www.alnoorpalace.in/"} />
      <meta name={"robots"} content={"index, follow"} />
      <meta name={"audience"} content={"all"} />
      <meta name={"author"} content={"Al NOOR RESIDENCY"} />
      <meta name={"contact"} content={"booking@alnoorresidency.in"} />
      <meta name={"revisit-after"} content={"3 days"} />
      <meta name={"language"} content={"english"} />
      <meta name={"distribution"} content={"global"} />
      <meta name={"rating"} content={"general"} />
      <meta name={"copyright"} content={"by https://www.alnoorpalace.in/"} />
      <meta name={"url"} content={"https://www.alnoorpalace.in/"} />
      <meta name={"twitter:card"} content={"summary"} />
      <meta name={"twitter:site"} content={"https://www.alnoorpalace.in/"} />
      <meta name={"twitter:title"} content={"Family Hostels in Chennai | Al Noor Residency"} />
      <meta name={"twitter:description"} content={"Al Noor Residency - Budget friendly hotel in sowcarpet offers premium business hotel accommodation in chennai,featuring comfortable hotel rooms and affordable stays"} />
      <meta name={"twitter:creator"} content={"Al NOOR RESIDENCY"} />
      <meta name={"twitter:image"} content={"https://www.alnoorpalace.in/_next/image?url=%2Fimg%2Flogo-mark.png&w=48&q=75"} />
      <meta property={"og:title"} content={"Best Family Stay in Chennai | Al Noor Residency"} />
      <meta property={"og:type"} content={"website"} />
      <meta property={"og:url"} content={"https://www.alnoorpalace.in/"} />
      <meta property={"og:image"} content={"https://www.facebook.com/photo/?fbid=122129919375105336&set=a.122100104505105336&locale=ta_IN/"} />
      <meta property={"og:description"} content={"Al Noor Residency - Couple Friendly Hotel offers comfortable business hotel accommodation in high cour metro sattion, featuring hote rooms and budget-friendly stays"} />
      <meta property={"og:site_name"} content={"https://www.facebook.com/people/Al-Noor-Residency/61583160103826/?locale=ta_IN#/"} />
      <meta property={"fb:admins"} content={""} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON_LD }} />
    </Head>
  );
}
