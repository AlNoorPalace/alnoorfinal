import Head from "next/head";

// The Parrys hotel page's search-engine block (title, meta tags, social tags and LocalBusiness data),
// supplied by the owner and kept exactly as written. Do not reword or reformat these values.

const JSON_LD = "\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"LocalBusiness\",\n  \"name\": \"Al NOOR RESIDENCY\",\n  \"image\": \"https://www.alnoorpalace.in/_next/image?url=%2Fimg%2Flogo-mark.png&w=48&q=75\",\n  \"@id\": \"https://www.alnoorpalace.in/\",\n  \"url\": \"https://www.alnoorpalace.in/hotels/parrys/\",\n  \"telephone\": \"073389 55111\",\n  \"address\": {\n    \"@type\": \"PostalAddress\",\n    \"streetAddress\": \"2nd Floor, 221/222, NSC Bose Rd, Parrys Corner, George Town,Tamil Nadu\",\n    \"addressLocality\": \"Chennai\",\n    \"postalCode\": \"600001\",\n    \"addressCountry\": \"IN\"\n  },\n  \"geo\": {\n    \"@type\": \"GeoCoordinates\",\n    \"latitude\": 13.08901,\n    \"longitude\": 80.28581\n  },\n  \"openingHoursSpecification\": {\n    \"@type\": \"OpeningHoursSpecification\",\n    \"dayOfWeek\": [\n      \"Monday\",\n      \"Tuesday\",\n      \"Wednesday\",\n      \"Thursday\",\n      \"Friday\",\n      \"Saturday\",\n      \"Sunday\"\n    ],\n    \"opens\": \"00:00\",\n    \"closes\": \"23:59\"\n  } \n}\n";

export default function ParrysSeo() {
  return (
    <Head>
      <title>{"Hotel in Parrys Corner Chennai | Budget Business Hotel Parrys"}</title>
      <meta name={"description"} content={"Al Noor Residency offers budget friendly accommodation hotels in chennai, with comfortable rooms and warm hospitality for every stay"} />
      <meta name={"keywords"} content={"best hotels in mannady, hotel in parrys corner, family stay near chennai central, hotels near high court, best couple friendly hotels in sowcarpet, best family stay near parrys"} />
      <link rel={"canonical"} href={"https://www.alnoorpalace.in/hotels/parrys/"} />
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
      <meta name={"twitter:title"} content={"Family Stay in Parrys Corner | Al Noor Residency"} />
      <meta name={"twitter:description"} content={"Al Noor Residency - family hotel provides comfortable accommodation in  mannady, offering couple friendly hotel rooms and business stays in Parrys"} />
      <meta name={"twitter:creator"} content={"Al NOOR RESIDENCY"} />
      <meta name={"twitter:image"} content={"https://www.alnoorpalace.in/_next/image?url=%2Fimg%2Flogo-mark.png&w=48&q=75"} />
      <meta property={"og:title"} content={"Premium Hotels in Chennai | Al Noor Residency"} />
      <meta property={"og:type"} content={"website"} />
      <meta property={"og:url"} content={"https://www.alnoorpalace.in/"} />
      <meta property={"og:image"} content={"https://www.facebook.com/photo/?fbid=122129919375105336&set=a.122100104505105336&locale=ta_IN/"} />
      <meta property={"og:description"} content={"Al Noor Residency - offers premium stay in Parrys Corner with comfortable rooms, affordable stays, modern amenities"} />
      <meta property={"og:site_name"} content={"https://www.facebook.com/people/Al-Noor-Residency/61583160103826/?locale=ta_IN#/"} />
      <meta property={"fb:admins"} content={""} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON_LD }} />
    </Head>
  );
}
