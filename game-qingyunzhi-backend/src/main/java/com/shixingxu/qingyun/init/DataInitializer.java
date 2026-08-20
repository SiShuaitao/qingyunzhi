package com.shixingxu.qingyun.init;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shixingxu.qingyun.entity.Banner;
import com.shixingxu.qingyun.entity.Character;
import com.shixingxu.qingyun.entity.Feature;
import com.shixingxu.qingyun.entity.Game;
import com.shixingxu.qingyun.entity.News;
import com.shixingxu.qingyun.entity.Sect;
import com.shixingxu.qingyun.mapper.BannerMapper;
import com.shixingxu.qingyun.mapper.CharacterMapper;
import com.shixingxu.qingyun.mapper.FeatureMapper;
import com.shixingxu.qingyun.mapper.GameMapper;
import com.shixingxu.qingyun.mapper.NewsMapper;
import com.shixingxu.qingyun.mapper.SectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 首次启动时初始化种子数据：青云志游戏元数据、Banner、角色、门派、玩法特色、资讯。
 * 《青云志》—— 以水墨工笔重写仙侠，水墨晕染画卷、烟雨光影、霜雪特效，文艺清冷唯美叙事。
 */
@Slf4j
@Component
@Order(10)
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final GameMapper gameMapper;
    private final NewsMapper newsMapper;
    private final BannerMapper bannerMapper;
    private final CharacterMapper characterMapper;
    private final SectMapper sectMapper;
    private final FeatureMapper featureMapper;

    @Override
    public void run(String... args) {
        seedGame();
        seedBanners();
        seedCharacters();
        seedSects();
        seedFeatures();
        seedNews();
    }

    private void seedGame() {
        Long count = gameMapper.selectCount(new QueryWrapper<>());
        if (count != null && count > 0) {
            log.info("游戏作品已存在 ({} 条), 跳过初始化", count);
            return;
        }
        Game game = new Game();
        game.setGameId("qingyun");
        game.setName("青云志");
        game.setSubtitle("QING YUN");
        game.setCategory("文艺仙侠");
        game.setTagline("水墨工笔 · 烟雨留白 · 国风仙侠");
        game.setSummary("水墨晕染、烟雨霜雪，人物立绘于画卷中浮现。");
        game.setDescription("《青云志》以水墨工笔重写仙侠。水墨晕染画卷、柔和烟雨光影、霜雪特效流转，人物立绘于烟雨中动态悬浮。极简留白的国风意境中，藏着一段清冷唯美的叙事。星河为引，剑意为锋，在水墨山水之间，每一帧都是一卷可驻足的画卷，每一剑都是一句未说出口的告白。");
        game.setUrl("http://qingyun.shixingxu.local");
        game.setCover("linear-gradient(160deg,#0e1828 0%,#1a2a48 45%,#34507a 100%), radial-gradient(circle at 70% 30%, rgba(180,210,255,0.35), transparent 50%)");
        game.setStyle("starlight");
        game.setFeatured(1);
        game.setSort(10);
        game.setStatus(1);
        gameMapper.insert(game);
        log.info("已初始化青云志游戏元数据");
    }

    private void seedBanners() {
        Long count = bannerMapper.selectCount(new QueryWrapper<>());
        if (count != null && count > 0) {
            log.info("Banner 已存在 ({} 条), 跳过初始化", count);
            return;
        }
        List<Banner> banners = new ArrayList<>();
        banners.add(buildBanner(
                "青云志 · 清冷唯美",
                "水墨晕染、烟雨霜雪，国风叙事",
                "linear-gradient(160deg,#0e1828 0%,#1a2a48 45%,#34507a 100%), radial-gradient(circle at 70% 30%, rgba(180,210,255,0.35), transparent 50%)",
                "#features", 10
        ));
        banners.add(buildBanner(
                "七剑下青云",
                "七子列阵，剑问星河",
                "radial-gradient(circle at 30% 40%, rgba(180,210,255,0.28), transparent 55%), linear-gradient(150deg,#0e1828 0%,#21345a 60%,#34507a 100%)",
                "#characters", 20
        ));
        banners.add(buildBanner(
                "星河剑灵 · 共生契约",
                "与剑灵立约，共赴清冷之约",
                "radial-gradient(ellipse at 60% 30%, rgba(160,180,255,0.32), transparent 55%), linear-gradient(165deg,#0a1422 0%,#1a2a48 55%,#284068 100%)",
                "#sects", 30
        ));
        banners.forEach(bannerMapper::insert);
        log.info("已初始化 {} 条 Banner", banners.size());
    }

    private void seedCharacters() {
        List<Character> characters = new ArrayList<>();

        // 青云七子（原有六位，封面升级为水墨立绘图片）
        characters.add(buildCharacter(
                "沈青霄", "剑修", "青云剑宗", "剑客", "中",
                "青云七子之首，执剑问心，孤高如月。他于冷雾中独行，剑出无声，却引星河倒悬。世人只见其清冷，不知那柄长剑之下，藏着一诺千钧的温柔。",
                portraitUrl("Chinese ink wash painting, xianxia swordsman in flowing white and pale blue robes, holding a slender long sword, lone figure in cold mountain mist under moonlight, ink brush strokes, watercolor bleed, dark background, portrait"),
                10
        ));

        characters.add(buildCharacter(
                "林星河", "剑灵共生者", "星河阁", "法师", "高",
                "与星河剑灵立下共生之约，眸中常映冷光。他寡言少语，却能与剑灵心意相通。每一次出剑，皆是星辰坠落人间的回响，清冷而决绝。",
                portraitUrl("Chinese ink wash painting, xianxia mage with starlight eyes, dark robes with glowing star patterns, cold starlight aura, ink wash background with scattered stars, watercolor, portrait"),
                20
        ));

        characters.add(buildCharacter(
                "苏暮霜", "霜华医者", "霜华医庐", "辅助", "低",
                "霜华医庐传人，以霜华之力疗世间伤。她步履轻柔，指尖凝霜成露，落处皆是清辉。世人称她为寒月之下的提灯人，温润而静谧。",
                portraitUrl("Chinese ink wash painting, xianxia female healer in pale teal robes, frost crystallizing at fingertips, gentle expression, soft moonlight, ink wash mist, watercolor, portrait"),
                30
        ));

        characters.add(buildCharacter(
                "陆北辰", "北辰行者", "北辰暗行", "刺客", "高",
                "北辰暗行使者，于暗夜中行走，以北辰星为引。他来去无踪，剑出如夜色吞光。世人难见其真容，唯闻夜风中那一声极轻的剑鸣。",
                portraitUrl("Chinese ink wash painting, xianxia assassin in dark hooded robes, hidden face, dagger, night scene with single north star, ink wash shadows, watercolor, portrait"),
                40
        ));

        characters.add(buildCharacter(
                "云轻舞", "云裳舞者", "青云剑宗", "射手", "中",
                "云裳舞者，远程剑气如行云流水。她以舞入剑，剑气化为流光，在冷雾间织就一张无形的网。每一式皆是清冷之美，亦是致命之锋。",
                portraitUrl("Chinese ink wash painting, xianxia female archer in flowing cloud-pattern robes, drawing a bow, graceful dance pose, misty clouds, ink wash background, watercolor, portrait"),
                50
        ));

        characters.add(buildCharacter(
                "顾长歌", "长歌琴修", "星河阁", "法师", "中",
                "长歌琴修，琴音可镇魂，亦可破阵。他独坐青云之巅，指尖拨动星辉，一曲清音便让万剑归心。水墨光影中，他是那个以音律问道的孤行者。",
                portraitUrl("Chinese ink wash painting, xianxia male musician in scholar robes, playing a guqin zither, starlight strings, ink wash mist, watercolor, scholarly atmosphere, portrait"),
                60
        ));

        // 新增四位人物（共十位）
        characters.add(buildCharacter(
                "秦未央", "落霞剑客", "青云剑宗", "剑客", "高",
                "落霞剑客，双刃如焰。她以朱砂入剑，剑出似晚霞漫天，热烈而决绝。世人只见她笑对强敌，却不知那双短刃之下，藏着一段不愿回首的旧事。她是青云剑宗中最锋利的一抹朱色。",
                portraitUrl("Chinese ink wash painting, xianxia female swordswoman in crimson and ink robes, dusk sunset, twin short swords, determined expression, ink wash clouds, watercolor, portrait"),
                70
        ));

        characters.add(buildCharacter(
                "白藏主", "霜华药王", "霜华医庐", "辅助", "低",
                "白藏药王，霜华医庐老主。他悬壶济世数十载，以霜华炼丹，一指可续断魂。岁月沉淀于眉间，他是水墨江湖中最温润的存在，亦是青云山下最不可缺的那盏长明灯。",
                portraitUrl("Chinese ink wash painting, xianxia elderly medicine master in pale green robes, white beard, holding a gourd of elixir, herbal mist, ink wash bamboo, watercolor, portrait"),
                80
        ));

        characters.add(buildCharacter(
                "夜听雨", "听雨夜行者", "北辰暗行", "刺客", "高",
                "听雨夜行者，伞下藏锋。她以油纸伞为引，雨声为剑，于绵绵烟雨中取敌首级。世人闻雨不见人，唯见伞影一闪，便已是阴阳两隔。她是北辰暗行中最静谧的那道锋芒。",
                portraitUrl("Chinese ink wash painting, xianxia assassin in grey robes under oil-paper umbrella in rain, hidden blade, rainy night, ink wash rain streaks, watercolor, portrait"),
                90
        ));

        characters.add(buildCharacter(
                "楚云深", "云深星射", "星河阁", "射手", "中",
                "云深星射，长弓引星河。他立于云海之巅，一箭可穿云裂石，箭意如星辉清冷。孤高寡言，唯以箭问道。世人难见其面，唯见云深之处那一道破空而去的星光。",
                portraitUrl("Chinese ink wash painting, xianxia male archer in azure robes drawing a longbow, cloud-wreathed mountain peak, arrow of starlight, ink wash clouds, watercolor, portrait"),
                100
        ));

        // upsert-by-name：存在则更新封面与字段，不存在则插入
        int insertCount = 0;
        int updateCount = 0;
        for (Character c : characters) {
            Character existing = characterMapper.selectOne(
                    new QueryWrapper<Character>().eq("name", c.getName())
            );
            if (existing != null) {
                c.setId(existing.getId());
                characterMapper.updateById(c);
                updateCount++;
            } else {
                characterMapper.insert(c);
                insertCount++;
            }
        }
        log.info("角色同步完成：新增 {} 个，更新 {} 个，共 {} 个", insertCount, updateCount, characters.size());
    }

    /**
     * 构建水墨立绘图片 URL（text_to_image 接口，portrait_4_3 竖版构图）。
     */
    private String portraitUrl(String prompt) {
        try {
            return "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt="
                    + URLEncoder.encode(prompt, StandardCharsets.UTF_8.name())
                    + "&image_size=portrait_4_3";
        } catch (UnsupportedEncodingException e) {
            // StandardCharsets.UTF_8 一定存在，理论上不会到达
            return "linear-gradient(160deg,#0e1828,#1a2a48,#34507a)";
        }
    }

    private void seedSects() {
        Long count = sectMapper.selectCount(new QueryWrapper<>());
        if (count != null && count > 0) {
            log.info("门派已存在 ({} 条), 跳过初始化", count);
            return;
        }
        List<Sect> sects = new ArrayList<>();

        sects.add(buildSect(
                "青云剑宗", "QING YUN SWORD",
                "以剑问心",
                "青云山上第一剑修大宗，以剑问心，以心御剑。宗门立于云海之上，常年冷雾缭绕，月光如水倾泻。弟子皆以孤高自律，追求剑与心的极致合一，是青云志中最纯粹的剑之信仰。",
                "radial-gradient(circle at 50% 25%, rgba(180,210,255,0.35), transparent 55%), linear-gradient(160deg,#0e1828,#1a2a48,#34507a)",
                10
        ));

        sects.add(buildSect(
                "星河阁", "STARRY PAVILION",
                "星辰为引，心剑合一",
                "与剑灵共生的隐世之门，信奉星辰为引，心剑合一。阁中弟子皆与一缕剑灵立约，以星河为脉，借剑灵之力斩出超越凡俗的一击。冷光流转间，剑与灵已不分彼此。",
                "radial-gradient(circle at 55% 30%, rgba(160,180,255,0.34), transparent 55%), linear-gradient(155deg,#0a1422,#1a2a48,#284068)",
                20
        ));

        sects.add(buildSect(
                "霜华医庐", "FROST HEALER HALL",
                "医者仁心，霜华济世",
                "青云山下的医修圣地，以霜华济世为训。医庐四季凝霜，药田生辉，弟子以霜华之力疗伤祛厄。这里是水墨江湖中难得的温润之地，医者仁心，霜华不寒。",
                "radial-gradient(circle at 45% 28%, rgba(210,230,255,0.4), transparent 55%), linear-gradient(160deg,#142236,#22344f,#3a5278)",
                30
        ));

        sects.add(buildSect(
                "北辰暗行", "NORTH STAR ORDER",
                "星引北辰，暗行正道",
                "隐于暗夜的守序者，以星引北辰，暗行正道。他们不立山门，不显名号，只在夜色中默默维护着青云七界的秩序。世人难见其踪，却知有他们在，星河便不会坠落。",
                "radial-gradient(circle at 60% 28%, rgba(120,150,210,0.32), transparent 55%), linear-gradient(165deg,#08111e,#142236,#1f3252)",
                40
        ));

        sects.forEach(sectMapper::insert);
        log.info("已初始化 {} 个门派", sects.size());
    }

    private void seedFeatures() {
        Long count = featureMapper.selectCount(new QueryWrapper<>());
        if (count != null && count > 0) {
            log.info("玩法特色已存在 ({} 条), 跳过初始化", count);
            return;
        }
        List<Feature> features = new ArrayList<>();

        features.add(buildFeature(
                "水墨工笔画卷级渲染",
                "分层渲染管线，电影画卷级画面",
                "采用分层渲染管线，将每一帧画面打磨为画卷级质感。水墨晕染分层叠加，笔触工细如工笔，让战斗与叙事都沉浸于清冷唯美的视觉氛围之中。",
                "✦", 10
        ));

        features.add(buildFeature(
                "人物立绘烟雨悬浮",
                "基于物理的立绘动态系统",
                "基于物理的立绘动态系统，让角色于烟雨中轻盈悬浮。水墨晕染环绕，衣袂随山风微动，每一次呼吸都伴随霜雪流转，呈现出呼吸感十足的人物呈现。",
                "✧", 20
        ));

        features.add(buildFeature(
                "烟雨霜雪特效系统",
                "烟雨霜雪随叙事节奏流转",
                "烟雨霜雪随叙事节奏流转，剑气、霜华、星辉皆化作水墨笔触。它们在战斗中汇聚成河，在过场中飘散如雪，让整个青云世界都笼罩在清冷的水墨叙事之中。",
                "✦", 30
        ));

        features.add(buildFeature(
                "双世界叙事",
                "幻境与仙侠双线交织",
                "幻境与仙侠双线交织，星河与剑意并行。玩家在水墨写意的现实与烟雨笼罩的幻境之间穿行，揭开一段跨越两界的清冷唯美叙事，体验独特的国风仙侠。",
                "✧", 40
        ));

        features.add(buildFeature(
                "琴剑合奏战斗系统",
                "音游与即时战斗的融合",
                "音游与即时战斗的融合，琴音为引，剑意为锋。每一次拨弦皆是一次出剑，节奏与连招共振，在水墨光影中奏响一曲清冷的战斗乐章。",
                "✦", 50
        ));

        features.forEach(featureMapper::insert);
        log.info("已初始化 {} 条玩法特色", features.size());
    }

    private void seedNews() {
        List<News> newsList = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        newsList.add(buildNews(
                "幕后揭秘：《青云志》清冷唯美光影的诞生",
                "水墨工笔画卷与烟雨霜雪特效，如何做到国风叙事。",
                "《青云志》美术团队首次揭秘清冷唯美光影的幕后。画卷采用水墨工笔分层渲染管线，人物立绘基于物理光照动态悬浮于烟雨之中，烟雨霜雪特效随镜头叙事节奏流转。我们力求在水墨国风与仙侠之间找到独特平衡，让每一帧都成为可驻足的画卷。",
                "news", now.minusDays(2)
        ));

        newsList.add(buildNews(
                "立绘技术首曝：光雾悬浮的物理实现",
                "人物立绘如何在烟雨中轻盈悬浮，呼吸感如何呈现。",
                "本周我们公开《青云志》人物立绘烟雨悬浮系统的技术细节。该系统基于物理的动态模拟，水墨晕染环绕角色周身，衣袂随山风微动，每一次呼吸都伴随霜雪流转。这是一套为文艺清冷叙事量身打造的立绘呈现方案，力求让角色真正活在烟雨之中。",
                "news", now.minusDays(6)
        ));

        newsList.add(buildNews(
                "角色首曝：青云七子之首沈青霄",
                "执剑问心，孤高如月，剑出无声引星河倒悬。",
                "今日正式首曝《青云志》核心角色——青云七子之首沈青霄。他执剑问心，孤高如月，于冷雾中独行，剑出无声却引星河倒悬。作为剑客定位、中等难度的角色，他将是玩家步入青云世界时最先遇见的那道光。更多角色档案将于近期陆续揭晓。",
                "notice", now.minusDays(11)
        ));

        newsList.add(buildNews(
                "首轮限量测试定档：清冷之约即将启程",
                "《青云志》首轮限量技术测试即将开启，邀你共赴青云。",
                "《青云志》首轮限量技术测试定档下月正式开启。本次测试将开放青云剑宗与星河阁两大门派，以及沈青霄、林星河、苏暮霜三位角色，供受邀玩家抢先体验水墨工笔渲染与琴剑合奏战斗系统。测试资格招募通道现已开放，期待与你共赴这场清冷之约。",
                "activity", now.minusDays(16)
        ));

        newsList.add(buildNews(
                "世界观解读：轻科幻笔触下的仙侠重构",
                "星河与剑意并行，双世界叙事如何重新书写仙侠。",
                "《青云志》以水墨工笔重写仙侠。星河为引，剑意为锋，玩家将在水墨写意的现实与烟雨笼罩的幻境之间穿行，揭开一段跨越两界的清冷唯美叙事。我们希望以水墨工笔与烟雨光影，为东方仙侠题材注入一种极简留白的国风意境，让传统与现代在青云之上相遇。",
                "news", now.minusDays(22)
        ));

        newsList.add(buildNews(
                "招募启事：与青云共赴清冷之约",
                "技术美术、服务端、剧情策划多岗位开放招募。",
                "《青云志》持续扩张中，技术美术、服务端工程师、剧情策划多个岗位开放招募。我们寻找热爱文艺叙事、相信水墨国风仙侠仍有无穷可能的伙伴。如果你也向往水墨光影下那段清冷唯美的故事，欢迎投递简历至 hr@shixingxu.com，与青云共赴这场清冷之约。",
                "activity", now.minusDays(30)
        ));

        // 新增三条资讯
        newsList.add(buildNews(
                "角色首曝：落霞剑客秦未央",
                "朱砂入剑，双刃如焰，热烈而决绝的落霞之刃。",
                "今日首曝《青云志》新角色——落霞剑客秦未央。她以朱砂入剑，双刃如焰，剑出似晚霞漫天。与青云七子的清冷不同，她是水墨长卷中最浓烈的一笔朱色。作为剑客定位、高难度的角色，她将以极致的连击与爆发，为玩家带来截然不同的战斗节奏。更多角色档案与实战演示将于近期公开。",
                "notice", now.minusDays(1)
        ));

        newsList.add(buildNews(
                "玩法深度解析：琴剑合奏战斗系统实战",
                "音游与即时战斗融合，琴音为引，剑意为锋。",
                "本周我们深度解析《青云志》核心玩法——琴剑合奏战斗系统。该系统将音游节奏与即时战斗深度融合：每一次拨弦皆是一次出剑，节奏与连招共振，在水墨光影中奏响一曲清冷的战斗乐章。玩家可通过节奏判定触发「剑意共鸣」，在精准节拍上释放技能可造成额外霜华伤害。这是一套为文艺清冷叙事量身打造的战斗体验，力求让每一场战斗都成为可驻足的画卷。",
                "news", now.minusDays(4)
        ));

        newsList.add(buildNews(
                "预约里程碑奖励解锁：立绘壁纸·内测资格·限定称号",
                "全平台预约人数突破里程碑，多重清冷之礼解锁。",
                "《青云志》全平台预约人数持续突破，多重里程碑奖励现已解锁：预约即得高清水墨立绘壁纸一套；预约突破五十万，全员获得「清冷之约」限定称号；预约突破百万，受邀玩家可获首轮限量内测资格与「青云七子」主题头像框。立即在官网预约页面留下你的联系方式与平台，与青云共赴这场清冷之约，让水墨长卷因你而展开。",
                "activity", now.minusDays(8)
        ));

        // upsert-by-title：存在则跳过，不存在则插入
        int insertCount = 0;
        int skipCount = 0;
        for (News n : newsList) {
            Long exists = newsMapper.selectCount(
                    new QueryWrapper<News>().eq("title", n.getTitle())
            );
            if (exists != null && exists > 0) {
                skipCount++;
            } else {
                newsMapper.insert(n);
                insertCount++;
            }
        }
        log.info("资讯同步完成：新增 {} 条，已存在跳过 {} 条，共 {} 条", insertCount, skipCount, newsList.size());
    }

    private Banner buildBanner(String title, String subtitle, String cover, String link, int sort) {
        Banner banner = new Banner();
        banner.setTitle(title);
        banner.setSubtitle(subtitle);
        banner.setCover(cover);
        banner.setLink(link);
        banner.setSort(sort);
        banner.setStatus(1);
        return banner;
    }

    private Character buildCharacter(String name, String title, String faction, String role,
                                     String difficulty, String description, String cover, int sort) {
        Character character = new Character();
        character.setName(name);
        character.setTitle(title);
        character.setFaction(faction);
        character.setRole(role);
        character.setDifficulty(difficulty);
        character.setDescription(description);
        character.setCover(cover);
        character.setSort(sort);
        character.setStatus(1);
        return character;
    }

    private Sect buildSect(String name, String subtitle, String philosophy,
                           String description, String cover, int sort) {
        Sect sect = new Sect();
        sect.setName(name);
        sect.setSubtitle(subtitle);
        sect.setPhilosophy(philosophy);
        sect.setDescription(description);
        sect.setCover(cover);
        sect.setSort(sort);
        sect.setStatus(1);
        return sect;
    }

    private Feature buildFeature(String title, String summary, String description,
                                 String icon, int sort) {
        Feature feature = new Feature();
        feature.setTitle(title);
        feature.setSummary(summary);
        feature.setDescription(description);
        feature.setIcon(icon);
        feature.setSort(sort);
        feature.setStatus(1);
        return feature;
    }

    private News buildNews(String title, String summary, String content, String category, LocalDateTime publishTime) {
        News news = new News();
        news.setTitle(title);
        news.setSummary(summary);
        news.setContent(content);
        news.setCategory(category);
        news.setPublishTime(publishTime);
        news.setStatus(1);
        return news;
    }
}
