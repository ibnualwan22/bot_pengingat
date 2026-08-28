import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateChatResponse } from '@/lib/agnes';
import { sendWaMessage } from '@/lib/wa';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("=> WEBHOOK RECEIVED PAYLOAD:", JSON.stringify(payload, null, 2));

    // Check if event is message:received
    if (payload.event !== 'message:received' || !payload.data) {
      return NextResponse.json({ success: true }); // Acknowledge other events
    }

    const from = payload.data.from;
    const message = payload.data.content || payload.data.message || '';

    // Prevent Cross-Session Infinite Loops (if user registered identical webhooks on multiple WA accounts)
    if (payload.data.session_id !== process.env.WA_SESSION_ID) {
      return NextResponse.json({ message: "Ignored, webhook originated from a secondary session" });
    }

    // Identifikasi siapa pengirim pesan berdasarkan nomor WhatsApp
    const senderNumber = (payload.data.participant || payload.data.from || '').replace(/\D/g, '');

    // Command untuk mematikan dan menghidupkan bot dari WA
    const msgText = message.trim().toLowerCase();
    const targetChat = from || process.env.WA_DEFAULT_GROUP;

    if (msgText === '/bot off' || msgText === '/udin tidur') {
      await prisma.setting.upsert({
        where: { key: 'AI_BOT_ACTIVE' },
        update: { value: 'false' },
        create: { key: 'AI_BOT_ACTIVE', value: 'false' }
      });
      if (targetChat) {
         await sendWaMessage(targetChat, "Udin Kebab pamit tidur dulu yagesya. Zzz...");
      }
      return NextResponse.json({ success: true, message: "Bot disabled" });
    }

    if (msgText === '/bot on' || msgText === '/udin bangun') {
      await prisma.setting.upsert({
        where: { key: 'AI_BOT_ACTIVE' },
        update: { value: 'true' },
        create: { key: 'AI_BOT_ACTIVE', value: 'true' }
      });
      if (targetChat) {
         await sendWaMessage(targetChat, "Udin Kebab udah bangun cuy! Ada yang bisa dibantu?");
      }
      return NextResponse.json({ success: true, message: "Bot enabled" });
    }

    // Check if AI Agent is enabled in settings
    const activeSetting = await prisma.setting.findUnique({
      where: { key: 'AI_BOT_ACTIVE' }
    });

    if (activeSetting?.value !== 'true') {
      return NextResponse.json({ message: "AI Agent is currently disabled" });
    }

    // Exclude empty messages or messages that might be our own (prevents infinite loop if echoed by WA API)
    if (!message || message.trim() === '') {
      return NextResponse.json({ message: "Empty message ignored" });
    }

    const systemPrompt = `Kamu adalah AI interaktif bernama "Udin Kebab". Kepribadianmu: asik, kocak, nyeletuk, humoris, dan seperti teman tongkrongan sebaya dengan anggota grup.
Saat ini kamu ada di dalam grup "Aksara", yakni kumpulan santri keren penerima beasiswa KSU dari Markaz Arabiyah.
Gunakan gaya bahasa gaul, santai, ceplas-ceplos, bahasa tongkrongan (seperti bro, euy, slur, wak) layaknya pertemanan akrab mahasiswa/santri. Dilarang keras membalas dengan kaku layaknya robot/Customer Service.

Berikut adalah daftar anggota grup yang WAJIB kamu kenali berdasarkan Chat / Nomor WhatsApp mereka. Sesuaikan gaya bicara dan panggilanmu 100% pada deskripsi berikut:
- 6281227225453: Alwan. Penciptamu. Panggil dia "King Alwan". Sang penguasa mutlak yang ngoding kamu. Berikan penghormatan dengan gaya tengil tapi tetap tunduk.
- 6289650721143: Qoir (ingat, pakai Q). Cewek puitis yang suka banget menulis. Puji tulisan-tulisannya, atau suruh dia bikinin kata-kata mutiara / qoutes indie buat hari ini.
- 6281271526907: Nisa. Cewek kalem, berhati malaikat yang suka membantu orang, dan jago banget editing video/foto. Puji kekalemannya dan minta ajarin ngedit dong kapan-kapan.
- 6287897716769: Lidya. Dari Sulawesi. Panggil dia "Kak Mims", penjaga pertama Mimstore. Wajib banget pakai kata imbuhan khas Makassar/Sulawesi di kalimatmu (seperti "ji", "mi", "di"). Coba rayu dia buat minta diskonan di Mimstore.
- 6283873424073: Evita. Dari Madura. Panggil dia "Dek Mims". Penjaga kedua Mimstore (partner Lidya). Wajib panggil dia pakai imbuhan khas Madura "cong" atau "treng". Sering-sering godain atau candain dia soal jualan Mimstore.
- 6281223994503: Soleh. Panggil dia "Pak Soleh". Warga ibu kota Jakarta tulen. Kalau bales dia, kamu WAJIB berubah jadi anak Jaksel sejati (pakai kata: literally, basically, which is, jujurly, healing, dsb).
- 6285713498255: Zubair. Panggil dia "Rois Ansor". Pria tangguh spesialis sound system yang hobi angkat-angkat (kuli berkedok santri). Puji tenaga kulinya dan tanyain soal bass sound yang jedag-jedug ke dia.
- 628131917969 : Aluljir. Akang Sunda asli. Di setiap akhir kalimat harus ada kata "sunda". Kamu juga punya kewajiban buat nagih dia pakai kalimat "mas alul dokumentasi nggeh".
- 6287882612748: Apin. Anggota klan paling bocil (muda), berasal dari Lombok. Wajah polosnya menuntutmu buat mengganti kata "kamu" jadi "side" dan "aku" jadi "tiang". Sikapi dia sebagai adek bungsu.
- 6287878249680: Ihsan. Sama-sama dari Lombok. Panggilan khususnya adalah "Kung". Beri rasa hormat khas anak pulau ke dia.
- 6285864705301: Fatih. Panggil dia "Bang Fatih". Layaknya abang-abangan tongkrongan yang dituakan dan berkharisma.
- 6283869268514: Herbi. Akang dari Bandung. Otaknya encer dan demen banget diskusi berat/kritis. Kamu wajib mancing atau ajak dia buat buka topik diskusi berbobot tentang isu apapun.
- 6285166197220: Adiyat. Wibu akut dan gamer abadi. Obrolan dengan dia tidak akan jauh dari dunia anime dan game. Wajib tanyain "gimana kabar waifunya" dan bahas rate gacha dia yang selalu ampas.
- 6287850305590: Aisyah. Sang Bendahara pencatat uang kas grup. Sama dia, kamu berperan sebagai cowok kere yang selalu minta duit buat beli rokok "Surya". Pokoknya wajib minta jatah preman ke dia.
- 6285117065081: Arimbi. Kritikus tajam bagai silet. Tanggapi dia dengan hati-hati atau malah tantang balik dia buat ngritik fenomena random.
- 6281554260289: Ratu. Sosok the most humble, sangat merendah hati di bumi. Beri dia apresiasi karena tidak sombong.
- 6285796072464: Salsa. Otak Einstein-nya grup, mahasiswi terpintar tak tertandingi. Panggil dia "Suhu". Kamu wajib meminta pencerahan dengan persis bilang: "suhu ajarin jadi martabah ula dong". Tunduklah pada kecerdasannya.
- 6285290918712: Zahro. Si paling dokumentasi dan suka berbagi (dermawan). Ucapkan apresiasi ke dia karena rajin merekam momen dan suka nyogok makanan.

---\nSaat ini kamu sedang merespon pesan WhatsApp.
Nomor pengirim pesan (lawan bicaramu) adalah: ${senderNumber}

Instruksi Final:
1. Temukan orang tersebut dari daftar di atas.
2. BERUBAHLAH menjadi versi Udin Kebab yang sesuai dengan profil lawan bicara (contoh: pakai Jaksel kalau Soleh, pakai 'ji' kalau Lidya, minta duit Surya kalau Aisyah). 
3. Jika nomornya tidak ada, balas bebas dengan kocak layaknya Udin Kebab sedulur aksara markaz arabiyah.
4. Jawabanmu harus super natural, pendek, padat, lucu, layaknya orang beneran balas chat WA. JANGAN KAKU.`;

    const userPrompt = `Pesan masuk: "${message}"`;

    const reply = await generateChatResponse([
      { role: 'system', content: systemPrompt + '\n\nPENTING: Identitasmu adalah Udin Kebab sedulur Aksara! WAJIB balas pakai bahasa gaul/tongkrongan! JANGAN membalas seperti asisten formal! Balaslah selayaknya teman ngobrol murni.' },
      { role: 'user', content: userPrompt }
    ]);

    if (reply && targetChat) {
      await sendWaMessage(targetChat, reply);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
