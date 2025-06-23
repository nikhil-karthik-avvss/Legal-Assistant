export default function UnderConstruction({ message = "We’re working hard to bring this feature to life. Please check back later!" }) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center text-blue-100">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-3xl font-bold text-yellow-300 mb-2">
          Page Under Construction
        </h1>
        <p className="text-lg text-blue-200 max-w-md">{message}</p>
      </div>
    );
  }
  