export default function Footer() {
  return (
    <footer className="flex px-8 pb-4 justify-center md:justify-start">
      <p className="text-xs text-muted-foreground text-center md:text-sm">Copyright © {new Date().getFullYear()} Samba Code – Todos os direitos reservados.</p>
    </footer >
  )
}