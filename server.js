const fastify = require("fastify")({ logger: true });

const mawaqit = require("@max-xoo/mawaqit");

const fs = require("fs");
const path = require("path");

const surahs = JSON.parse(fs.readFileSync(path.join("data", "surahs.json"), "utf-8"));

// Routes Quran existantes
fastify.get("/surahs", async () => {
    const surahsList = Object.values(surahs).map(surah => ({
        number: surah.number,
        name: surah.name,
        length: surah.length
    }));

    return {
        success: true,
        count: surahsList.length,
        data: surahsList
    };
});

fastify.get("/surah/:surah", {
    schema: {
        params: {
            type: "object",
            properties: {
                surah: { type: "string" }
            }
        }
    }
}, async (request, reply) => {
    const { surah } = request.params;
    const surahData = surahs[surah];

    if (!surahData) {
        reply.code(404);
        return {
            success: false,
            error: `Surah ${surah} not found`
        };
    }

    return {
        success: true,
        data: surahData
    };
});

fastify.get("/surah/:surah/:aya", {
    schema: {
        params: {
            type: "object",
            properties: {
                surah: { type: "string" },
                aya: { type: "string" }
            }
        }
    }
}, async (request, reply) => {
    const { surah, aya } = request.params;
    const surahData = surahs[surah];

    if (!surahData) {
        reply.code(404);
        return {
            success: false,
            error: `Surah ${surah} not found`
        };
    }

    const ayaIndex = parseInt(aya) - 1;

    if (ayaIndex < 0 || ayaIndex >= surahData.length) {
        reply.code(404);
        return {
            success: false,
            error: `Aya ${aya} not found in surah ${surah}`
        };
    }

    return {
        success: true,
        data: {
            surah: {
                number: surahData.number,
                name: surahData.name
            },
            aya: {
                number: parseInt(aya),
                ar: surahData.surah.ar[ayaIndex],
                fr: surahData.surah.fr[ayaIndex],
                pronunciation: surahData.pronunciation[ayaIndex],
                tafsir: surahData.tafsir.fr[ayaIndex]
            }
        }
    };
});

fastify.get("/surah/:surah/:aya/audio", {
    schema: {
        params: {
            type: "object",
            properties: {
                surah: { type: "string" },
                aya: { type: "string" }
            }
        }
    }
}, async (request, reply) => {
    const { surah, aya } = request.params;
    const surahData = surahs[surah];

    if (!surahData) {
        reply.code(404);
        return {
            success: false,
            error: `Surah ${surah} not found`
        };
    }

    const ayaNum = parseInt(aya);
    if (ayaNum < 1 || ayaNum > surahData.length) {
        reply.code(404);
        return {
            success: false,
            error: `Aya ${aya} not found in surah ${surah}`
        };
    }

    const audioPath = path.join(__dirname, "data", "audios", surah, `${aya}.mp3`);

    if (!fs.existsSync(audioPath)) {
        reply.code(404);
        return {
            success: false,
            error: `Audio for aya ${aya} of surah ${surah} not found`
        };
    }

    reply.type("audio/mpeg");
    reply.header("Content-Disposition", `inline; filename="surah-${surah}-aya-${aya}.mp3"`);

    const stream = fs.createReadStream(audioPath);
    return reply.send(stream);
});

// Routes Mawaqit
fastify.get("/mawaqit/:slug/search", {
    schema: {
        params: {
            type: "object",
            properties: {
                slug: { type: "string" }
            }
        }
    }
}, async (request, reply) => {
    const { slug } = request.params;
    
    try {
        const encodedSlug = encodeURIComponent(slug);
        const url = `https://mawaqit.net/api/2.0/mosque/search?word=${encodedSlug}&fields=slug%2Clabel`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            reply.code(response.status);
            return {
                success: false,
                error: `Failed to fetch mosque search results`
            };
        }
        
        const data = await response.json();
        
        return {
            success: true,
            data: data
        };
    } catch (error) {
        reply.code(500);
        return {
            success: false,
            error: `Error fetching mosque search: ${error.message}`
        };
    }
});

fastify.get("/mawaqit/:slug/prayer-times", {
    schema: {
        params: {
            type: "object",
            properties: {
                slug: { type: "string" }
            }
        }
    }
}, async (request, reply) => {
    const { slug } = request.params;
    
    try {
        const data = await mawaqit.getPrayerTimesOfTheDay(slug);
        
        return {
            success: true,
            data: data
        };
    } catch (error) {
        reply.code(500);
        return {
            success: false,
            error: `Error fetching prayer times: ${error.message}`
        };
    }
});

fastify.get("/mawaqit/:slug/announcements", async (request, reply) => {
    const { slug } = request.params;
    try {
        const data = await mawaqit.getAnnouncements(slug);
        return { success: true, data };
    } catch (error) {
        reply.code(500);
        return { success: false, error: `Error fetching announcements: ${error.message}` };
    }
});

const start = async () => {
    try {
        await fastify.listen({ port: 4001, host: "0.0.0.0" });
        console.log("\n🚀  Quran API started on http://localhost:4001");
        console.log("\nAvailable routes:");
        console.log("  GET /surahs");
        console.log("  GET /surah/:surah");
        console.log("  GET /surah/:surah/:aya");
        console.log("  GET /surah/:surah/:aya/audio");
        console.log("  GET /mawaqit/:slug/search");
        console.log("  GET /mawaqit/:slug/prayer-times");
        console.log("  ");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();