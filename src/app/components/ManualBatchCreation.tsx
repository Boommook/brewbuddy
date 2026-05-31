export default function ManualBatchCreation() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Manual Batch Creation</h1>
    </form>
  );
}