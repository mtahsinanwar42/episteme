import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="w-96 h-96 mb-8">
        <img
          src="/assets/images/error_image.png"
          alt="Not Found"
          className="w-full h-full object-cover"
        />
      </div>

      <h1 className="text-5xl! font-bold bg-linear-to-b from-gray-100 to-red-400 text-transparent bg-clip-text">
        404
      </h1>
      <h2 className="font-bold mb-2">Page Not Found</h2>

      <p className="text-center mb-4">
        Sorry, the page you are looking for does not exist or has been moved.
        <br />
        Please check the URL or return to the{" "}
        <Link to="/" className="underline text-foreground/80">
          homepage
        </Link>
        .
      </p>
    </div>
  );
}
