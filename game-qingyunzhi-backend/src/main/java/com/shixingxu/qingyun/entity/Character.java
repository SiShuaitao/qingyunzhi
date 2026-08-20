package com.shixingxu.qingyun.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 角色实体。
 */
@Data
@TableName("`character`")
public class Character implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 角色名 */
    private String name;

    /** 称号 */
    private String title;

    /** 所属门派 */
    private String faction;

    /** 定位：剑客 / 法师 / 辅助 / 刺客 / 射手 */
    private String role;

    /** 难度：低 / 中 / 高 */
    private String difficulty;

    /** 角色描述 */
    private String description;

    /** 封面渐变 / 图片地址 */
    private String cover;

    /** 排序值 */
    private Integer sort;

    /** 状态：1 上线 0 下线 */
    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
