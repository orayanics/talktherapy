import { FaBookmark } from "react-icons/fa";
const MEDIA_ITEMS = [
  {
    id: "1",
    title: "Getting Started with TypeScript",
    description: "An introduction to TypeScript and its core features.",
    body: "## TypeScript Basics\n\nTypeScript is a typed superset of JavaScript...",
    authorId: "author-001",
    createdAt: "2025-01-18T11:10:00Z",
    updatedAt: "2025-01-18T11:10:00Z",
    category: "Programming",
    tags: ["typescript", "javascript", "basics", "node"],
  },
  {
    id: "2",
    title: "Understanding React Hooks",
    description:
      "A deep dive into React Hooks and how to use them effectively.",
    body: "## React Hooks\n\nHooks let you use state and other React features...",
    authorId: "author-002",
    createdAt: "2025-01-18T11:10:00Z",
    updatedAt: "2025-01-18T11:10:00Z",
    category: "Frontend",
    tags: ["react", "hooks"],
  },
  {
    id: "3",
    title: "Markdown Tips & Tricks",
    description: "Improve your writing with advanced Markdown techniques.",
    body: "## Markdown Tips\n\nYou can use **bold**, _italic_, and `code`...",
    authorId: "author-001",
    createdAt: "2025-01-18T11:10:00Z",
    updatedAt: "2025-01-18T11:10:00Z",
    category: "Writing",
    tags: ["markdown", "documentation"],
  },
  {
    id: "4",
    title: "Node.js Performance Optimization",
    description: "Learn how to optimize Node.js applications for performance.",
    body: "## Performance\n\nUse clustering, caching, and async patterns...",
    authorId: "author-003",
    createdAt: "2025-01-18T11:10:00Z",
    updatedAt: "2025-01-18T11:10:00Z",
    category: "Backend",
    tags: ["nodejs", "performance"],
  },
  {
    id: "5",
    title: "Design Systems 101",
    description: "An overview of building and maintaining design systems.",
    body: "## Design Systems\n\nA design system is a collection of reusable components...",
    authorId: "author-004",
    createdAt: "2025-01-18T11:10:00Z",
    updatedAt: "2025-01-18T11:10:00Z",
    category: "Design",
    tags: ["design", "ui", "ux"],
  },
  {
    id: "6",
    title: "SEO Basics for Developers",
    description: "Essential SEO concepts every developer should know.",
    body: "## SEO Basics\n\nSearch Engine Optimization helps your content get discovered...",
    authorId: "author-002",
    createdAt: "2025-01-18T11:10:00Z",
    updatedAt: "2025-01-18T11:10:00Z",
    category: "Marketing",
    tags: ["seo", "web"],
  },
];

export default function PatientBookmark() {
  return (
    <div className="flex flex-col gap-2">
      {MEDIA_ITEMS.map((item) => {
        const { id, title, description, category } = item;
        return (
          <>
            <div
              key={id}
              className="flex flex-row justify-between border-b last:border-b-0 py-4"
            >
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
                <p className="text-xs text-gray-500 italic">{category}</p>
              </div>
              <button className="btn btn-primary">
                <FaBookmark />
              </button>
            </div>
          </>
        );
      })}
    </div>
  );
}
